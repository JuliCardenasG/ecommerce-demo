import { Test, TestingModule } from '@nestjs/testing';
import { OrderServiceController } from './order-service.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderStatus, UpdateOrderDto } from './dto/order.dto';
import { Order } from './schemas/order.schema';

describe('OrderServiceController', () => {
  let controller: OrderServiceController;

  const mockOrderService = {
    createOrder: jest.fn(),
    findAllOrders: jest.fn(),
    findOrderById: jest.fn(),
    updateOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
    handleInvoiceUploaded: jest.fn(),
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
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrderServiceController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = app.get<OrderServiceController>(OrderServiceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        price: 99.99,
        quantity: 2,
        productId: 'prod_123',
        customerId: 'cust_123',
        sellerId: 'seller_123',
      };

      mockOrderService.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(createOrderDto);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual({ data: mockOrder });
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const orders = [mockOrder];
      mockOrderService.findAllOrders.mockResolvedValue(orders);

      const result = await controller.getAllOrders();

      expect(mockOrderService.findAllOrders).toHaveBeenCalled();
      expect(result).toEqual({ data: orders });
    });
  });

  describe('getOrderById', () => {
    it('should return an order by id', async () => {
      const orderId = 'order_123';
      mockOrderService.findOrderById.mockResolvedValue(mockOrder);

      const result = await controller.getOrderById(orderId);

      expect(mockOrderService.findOrderById).toHaveBeenCalledWith(orderId);
      expect(result).toEqual({ data: mockOrder });
    });
  });

  describe('updateOrder', () => {
    it('should update order status', async () => {
      const orderId = 'order_123';
      const updateDto: UpdateOrderDto = { status: OrderStatus.ACCEPTED };
      const updatedOrder = { ...mockOrder, status: OrderStatus.ACCEPTED };

      mockOrderService.updateOrderStatus.mockResolvedValue(updatedOrder);

      const result = await controller.updateOrder(orderId, updateDto);

      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
        orderId,
        OrderStatus.ACCEPTED,
      );
      expect(result).toEqual({ data: updatedOrder });
    });

    it('should update order data', async () => {
      const orderId = 'order_123';
      const updateDto: UpdateOrderDto = { price: 199.99 };
      const updatedOrder = { ...mockOrder, price: 199.99 };

      mockOrderService.updateOrder.mockResolvedValue(updatedOrder);

      const result = await controller.updateOrder(orderId, updateDto);

      expect(mockOrderService.updateOrder).toHaveBeenCalledWith(
        orderId,
        updateDto,
      );
      expect(result).toEqual({ data: updatedOrder });
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();

      expect(result).toEqual({
        status: 'healthy',
        service: 'order-service',
        timestamp: expect.any(String),
      });
    });
  });

  describe('handleInvoiceUploaded', () => {
    it('should handle invoice uploaded event', async () => {
      const payload = { invoiceId: 'inv_123', orderId: 'order_123' };

      await controller.handleInvoiceUploaded(payload);

      expect(mockOrderService.handleInvoiceUploaded).toHaveBeenCalledWith(
        'inv_123',
        'order_123',
      );
    });
  });
});
