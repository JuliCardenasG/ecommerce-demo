import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { default as request } from 'supertest';
import { ApiGatewayModule } from './../src/api-gateway.module';

describe('API Gateway Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Order-Invoice Flow', () => {
    let orderId: string;

    it('should create order via gateway', async () => {
      const createOrderDto = {
        price: 199.99,
        quantity: 3,
        productId: 'prod_integration_test',
        customerId: 'cust_integration_test',
        sellerId: 'seller_integration_test',
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(201);

      expect(response.body.data).toMatchObject({
        price: 199.99,
        quantity: 3,
        status: 'CREATED',
      });

      orderId = response.body.data._id;
    });

    it('should get order via gateway', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .expect(200);

      expect(response.body.data._id).toBe(orderId);
    });

    it('should list orders via gateway', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should update order status to SHIPPED via gateway', async () => {
      const updateDto = { status: 'SHIPPED' };

      const response = await request(app.getHttpServer())
        .put(`/orders/${orderId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data.status).toBe('SHIPPED');
    });
  });

  describe('Health Checks', () => {
    it('should return gateway health', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/gateway')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'api-gateway',
        timestamp: expect.any(String),
      });
    });

    it('should return overall health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        services: expect.any(Object),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable errors gracefully', async () => {
      const invalidOrderDto = {
        price: -50,
        quantity: 0,
        productId: '',
        customerId: '',
        sellerId: '',
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(invalidOrderDto)
        .expect(400);
    });
  });
});
