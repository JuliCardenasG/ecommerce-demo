import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { default as request } from 'supertest';
import { OrderServiceController } from '../src/order-service.controller';
import { OrderService } from '../src/order.service';
import { OrderStatus } from '../src/dto/order.dto';

describe('OrderServiceController (e2e)', () => {
  let app: INestApplication;

  const mockOrderService = {
    createOrder: jest.fn(),
    findAllOrders: jest.fn(),
    findOrderById: jest.fn(),
    updateOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
    handleInvoiceUploaded: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrderServiceController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Order CRUD Operations', () => {
    it('should create a new order', async () => {
      const createOrderDto = {
        price: 99.99,
        quantity: 2,
        productId: 'prod_e2e_test',
        customerId: 'cust_e2e_test',
        sellerId: 'seller_e2e_test',
      };

      const mockOrder = {
        _id: 'order_123',
        ...createOrderDto,
        status: OrderStatus.CREATED,
      };

      mockOrderService.createOrder.mockResolvedValue(mockOrder);

      const response = await request(app.getHttpServer())
        .post('/')
        .send(createOrderDto)
        .expect(201);

      expect(response.body.data).toMatchObject({
        price: 99.99,
        quantity: 2,
        productId: 'prod_e2e_test',
        status: OrderStatus.CREATED,
      });
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(createOrderDto);
    });

    it('should get order by id', async () => {
      const orderId = 'order_123';
      const mockOrder = {
        _id: orderId,
        price: 99.99,
        quantity: 2,
        productId: 'prod_e2e_test',
        status: OrderStatus.CREATED,
      };

      mockOrderService.findOrderById.mockResolvedValue(mockOrder);

      const response = await request(app.getHttpServer())
        .get(`/${orderId}`)
        .expect(200);

      expect(response.body.data._id).toBe(orderId);
      expect(mockOrderService.findOrderById).toHaveBeenCalledWith(orderId);
    });

    it('should list all orders', async () => {
      const orders = [
        {
          _id: 'order_1',
          price: 50.0,
          quantity: 1,
          productId: 'prod_1',
          status: OrderStatus.CREATED,
        },
      ];

      mockOrderService.findAllOrders.mockResolvedValue(orders);

      const response = await request(app.getHttpServer()).get('/').expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(1);
      expect(mockOrderService.findAllOrders).toHaveBeenCalled();
    });

    it('should update order status', async () => {
      const orderId = 'order_123';
      const updateDto = { status: OrderStatus.ACCEPTED };
      const updatedOrder = {
        _id: orderId,
        price: 99.99,
        quantity: 2,
        status: OrderStatus.ACCEPTED,
      };

      mockOrderService.updateOrderStatus.mockResolvedValue(updatedOrder);

      const response = await request(app.getHttpServer())
        .put(`/${orderId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data.status).toBe(OrderStatus.ACCEPTED);
      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
        orderId,
        OrderStatus.ACCEPTED,
      );
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'order-service',
        timestamp: expect.any(String),
      });
    });
  });
});
