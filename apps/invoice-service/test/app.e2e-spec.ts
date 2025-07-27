import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { default as request } from 'supertest';
import { InvoiceServiceController } from '../src/invoice-service.controller';
import { InvoiceService } from '../src/invoice.service';

describe('InvoiceServiceController (e2e)', () => {
  let app: INestApplication;

  const mockInvoiceService = {
    uploadInvoice: jest.fn(),
    findInvoiceById: jest.fn(),
    findInvoiceByOrderId: jest.fn(),
    sendInvoice: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceServiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: mockInvoiceService,
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

  describe('Invoice Operations', () => {
    it('should find invoice by id', async () => {
      const invoiceId = 'invoice_123';
      const mockInvoice = {
        _id: invoiceId,
        orderId: 'order_123',
        sellerId: 'seller_test',
        filePath: '/uploads/invoice_123.pdf',
      };

      mockInvoiceService.findInvoiceById.mockResolvedValue(mockInvoice);

      const response = await request(app.getHttpServer())
        .get(`/${invoiceId}`)
        .expect(200);

      expect(response.body._id).toBe(invoiceId);
      expect(mockInvoiceService.findInvoiceById).toHaveBeenCalledWith(
        invoiceId,
      );
    });

    it('should find invoice by order id', async () => {
      const orderId = 'order_123';
      const mockInvoice = {
        _id: 'invoice_123',
        orderId: orderId,
        sellerId: 'seller_test',
      };

      mockInvoiceService.findInvoiceByOrderId.mockResolvedValue(mockInvoice);

      const response = await request(app.getHttpServer())
        .get(`/order/${orderId}`)
        .expect(200);

      expect(response.body.orderId).toBe(orderId);
      expect(mockInvoiceService.findInvoiceByOrderId).toHaveBeenCalledWith(
        orderId,
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
        service: 'invoice-service',
        timestamp: expect.any(String),
      });
    });
  });
});
