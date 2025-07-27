import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceServiceController } from './invoice-service.controller';
import { InvoiceService } from './invoice.service';
import { UploadInvoiceDto } from './dto/invoice.dto';
import { BadRequestException } from '@nestjs/common';

describe('InvoiceServiceController', () => {
  let controller: InvoiceServiceController;

  const mockInvoiceService = {
    uploadInvoice: jest.fn(),
    findInvoiceById: jest.fn(),
    findInvoiceByOrderId: jest.fn(),
    sendInvoice: jest.fn(),
  };

  const mockInvoice = {
    _id: 'invoice_123',
    orderId: 'order_123',
    sellerId: 'seller_123',
    pdfPath: '/uploads/invoices/invoice.pdf',
    uploadedAt: new Date(),
    sentAt: null,
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceServiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: mockInvoiceService,
        },
      ],
    }).compile();

    controller = app.get<InvoiceServiceController>(InvoiceServiceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadInvoice', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1000,
    } as Express.Multer.File;

    const uploadDto: UploadInvoiceDto = {
      orderId: 'order_123',
      sellerId: 'seller_123',
    };

    it('should upload an invoice successfully', async () => {
      mockInvoiceService.uploadInvoice.mockResolvedValue(mockInvoice);

      const result = await controller.uploadInvoice(mockFile, uploadDto);

      expect(mockInvoiceService.uploadInvoice).toHaveBeenCalledWith(
        uploadDto,
        mockFile,
      );
      expect(result).toEqual({ data: mockInvoice });
    });

    it('should throw BadRequestException if no file provided', async () => {
      await expect(
        controller.uploadInvoice(null as any, uploadDto),
      ).rejects.toThrow(BadRequestException);

      expect(mockInvoiceService.uploadInvoice).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if upload fails', async () => {
      mockInvoiceService.uploadInvoice.mockRejectedValue(
        new Error('Upload failed'),
      );

      await expect(
        controller.uploadInvoice(mockFile, uploadDto),
      ).rejects.toThrow(BadRequestException);

      expect(mockInvoiceService.uploadInvoice).toHaveBeenCalledWith(
        uploadDto,
        mockFile,
      );
    });
  });

  describe('findInvoiceById', () => {
    it('should return an invoice by id', async () => {
      const invoiceId = 'invoice_123';
      mockInvoiceService.findInvoiceById.mockResolvedValue(mockInvoice);

      const result = await controller.findInvoiceById(invoiceId);

      expect(mockInvoiceService.findInvoiceById).toHaveBeenCalledWith(
        invoiceId,
      );
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('findInvoiceByOrderId', () => {
    it('should return an invoice by order id', async () => {
      const orderId = 'order_123';
      mockInvoiceService.findInvoiceByOrderId.mockResolvedValue(mockInvoice);

      const result = await controller.findInvoiceByOrderId(orderId);

      expect(mockInvoiceService.findInvoiceByOrderId).toHaveBeenCalledWith(
        orderId,
      );
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();

      expect(result).toEqual({
        status: 'healthy',
        service: 'invoice-service',
        timestamp: expect.any(String),
      });
    });
  });

  describe('handleInvoiceSend', () => {
    it('should handle invoice send event', async () => {
      const payload = { invoiceId: 'invoice_123', orderId: 'order_123' };

      await controller.handleInvoiceSend(payload);

      expect(mockInvoiceService.sendInvoice).toHaveBeenCalledWith(
        'invoice_123',
        'order_123',
      );
    });
  });
});
