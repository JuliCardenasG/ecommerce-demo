import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderRepository } from './repositories/order.repository';
import { OrderStatus } from './dto/order.dto';
import { Order } from './schemas/order.schema';
import { OrderInvoiceEvents } from '@libs/kafka/interfaces/order-invoice.interface';

describe('OrderService', () => {
  let service: OrderService;

  const mockOrderRepository = {
    createOrder: jest.fn(),
    findAllOrders: jest.fn(),
    findOrderById: jest.fn(),
    updateOrder: jest.fn(),
  };

  const mockKafkaClient = {
    emit: jest.fn(),
  };

  const mockOrder: Order = {
    status: OrderStatus.CREATED,
    price: 99.99,
    quantity: 2,
    productId: 'prod_123',
    customerId: 'cust_123',
    sellerId: 'seller_123',
    invoiceId: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: mockOrderRepository,
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: mockKafkaClient,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order and emit ORDER_CREATED event', async () => {
      const orderData = {
        price: 99.99,
        quantity: 2,
        productId: 'prod_123',
        customerId: 'cust_123',
        sellerId: 'seller_123',
      };

      const createdOrder = { ...mockOrder, _id: 'order_id_123' };
      mockOrderRepository.createOrder.mockResolvedValue(createdOrder);

      const result = await service.createOrder(orderData);

      expect(mockOrderRepository.createOrder).toHaveBeenCalledWith(orderData);
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        OrderInvoiceEvents.ORDER_CREATED,
        {
          orderId: 'order_id_123',
          customerId: 'cust_123',
          sellerId: 'seller_123',
        },
      );
      expect(result).toEqual(createdOrder);
    });
  });

  describe('findAllOrders', () => {
    it('should return all orders', async () => {
      const orders = [mockOrder];
      mockOrderRepository.findAllOrders.mockResolvedValue(orders);

      const result = await service.findAllOrders();

      expect(mockOrderRepository.findAllOrders).toHaveBeenCalled();
      expect(result).toEqual(orders);
    });
  });

  describe('findOrderById', () => {
    it('should return an order by id', async () => {
      const orderId = 'order_123';
      mockOrderRepository.findOrderById.mockResolvedValue(mockOrder);

      const result = await service.findOrderById(orderId);

      expect(mockOrderRepository.findOrderById).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateOrder', () => {
    it('should update an order', async () => {
      const orderId = 'order_123';
      const updateData = { price: 199.99 };
      const updatedOrder = { ...mockOrder, price: 199.99 };

      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder);

      const result = await service.updateOrder(orderId, updateData);

      expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(
        orderId,
        updateData,
      );
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status to ACCEPTED', async () => {
      const orderId = 'order_123';
      const status = OrderStatus.ACCEPTED;
      const updatedOrder = { ...mockOrder, status: OrderStatus.ACCEPTED };

      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder);

      const result = await service.updateOrderStatus(orderId, status);

      expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(orderId, {
        status,
      });
      expect(result).toEqual(updatedOrder);
      expect(mockKafkaClient.emit).not.toHaveBeenCalled();
    });

    it('should emit INVOICE_SEND event when order is SHIPPED and has invoice', async () => {
      const orderId = 'order_123';
      const status = OrderStatus.SHIPPED;
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.SHIPPED,
        invoiceId: 'invoice_123',
      };

      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder);

      const result = await service.updateOrderStatus(orderId, status);

      expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(orderId, {
        status,
      });
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        OrderInvoiceEvents.INVOICE_SEND,
        {
          invoiceId: 'invoice_123',
          orderId: orderId,
        },
      );
      expect(result).toEqual(updatedOrder);
    });

    it('should not emit INVOICE_SEND event when order is SHIPPED but has no invoice', async () => {
      const orderId = 'order_123';
      const status = OrderStatus.SHIPPED;
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.SHIPPED,
        invoiceId: '',
      };

      mockOrderRepository.updateOrder.mockResolvedValue(updatedOrder);

      const result = await service.updateOrderStatus(orderId, status);

      expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(orderId, {
        status,
      });
      expect(mockKafkaClient.emit).not.toHaveBeenCalled();
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('handleInvoiceUploaded', () => {
    it('should update order with invoice ID and emit INVOICE_SEND if order is SHIPPED', async () => {
      const invoiceId = 'invoice_123';
      const orderId = 'order_123';
      const shippedOrder = { ...mockOrder, status: OrderStatus.SHIPPED };

      mockOrderRepository.findOrderById.mockResolvedValue(shippedOrder);

      await service.handleInvoiceUploaded(invoiceId, orderId);

      expect(mockOrderRepository.findOrderById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(orderId, {
        invoiceId,
      });
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        OrderInvoiceEvents.INVOICE_SEND,
        {
          invoiceId,
          orderId,
        },
      );
    });

    it('should update order with invoice ID but not emit INVOICE_SEND if order is not SHIPPED', async () => {
      const invoiceId = 'invoice_123';
      const orderId = 'order_123';
      const createdOrder = { ...mockOrder, status: OrderStatus.CREATED };

      mockOrderRepository.findOrderById.mockResolvedValue(createdOrder);

      await service.handleInvoiceUploaded(invoiceId, orderId);

      expect(mockOrderRepository.findOrderById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.updateOrder).toHaveBeenCalledWith(orderId, {
        invoiceId,
      });
      expect(mockKafkaClient.emit).not.toHaveBeenCalled();
    });

    it('should throw error if order not found', async () => {
      const invoiceId = 'invoice_123';
      const orderId = 'order_123';

      mockOrderRepository.findOrderById.mockResolvedValue(null);

      await expect(
        service.handleInvoiceUploaded(invoiceId, orderId),
      ).rejects.toThrow('Order with ID order_123 not found');

      expect(mockOrderRepository.findOrderById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.updateOrder).not.toHaveBeenCalled();
      expect(mockKafkaClient.emit).not.toHaveBeenCalled();
    });
  });
});
