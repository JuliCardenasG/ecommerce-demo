import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './repositories/invoice.repository';
import { UploadInvoiceDto } from './dto/invoice.dto';
import { OrderInvoiceEvents } from '@libs/kafka/interfaces/order-invoice.interface';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('InvoiceService', () => {
  let service: InvoiceService;

  const mockInvoiceRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByOrderId: jest.fn(),
    update: jest.fn(),
  };

  const mockKafkaClient = {
    emit: jest.fn(),
  };

  const mockInvoice = {
    _id: 'invoice_123',
    orderId: 'order_123',
    sellerId: 'seller_123',
    pdfPath: '/app/uploads/invoices/seller_123/order_123/test.pdf',
    uploadedAt: new Date(),
    sentAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: InvoiceRepository,
          useValue: mockInvoiceRepository,
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: mockKafkaClient,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);

    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadInvoice', () => {
    const mockFile = {
      buffer: Buffer.from('test pdf content'),
      originalname: 'test-invoice.pdf',
      mimetype: 'application/pdf',
      size: 1000,
    } as Express.Multer.File;

    const uploadDto: UploadInvoiceDto = {
      orderId: 'order_123',
      sellerId: 'seller_123',
    };

    it('should upload invoice successfully', async () => {
      mockInvoiceRepository.create.mockResolvedValue(mockInvoice);

      const result = await service.uploadInvoice(uploadDto, mockFile);

      expect(fs.mkdir).toHaveBeenCalledWith(
        '/app/uploads/invoices/seller_123/order_123',
        { recursive: true },
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('/app/uploads/invoices/seller_123/order_123/'),
        mockFile.buffer,
      );
      expect(mockInvoiceRepository.create).toHaveBeenCalledWith({
        orderId: 'order_123',
        sellerId: 'seller_123',
        uploadedAt: expect.any(Date),
        pdfPath: expect.stringContaining(
          '/app/uploads/invoices/seller_123/order_123/',
        ),
      });
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        OrderInvoiceEvents.INVOICE_UPLOADED,
        {
          invoiceId: 'invoice_123',
          orderId: 'order_123',
        },
      );
      expect(result).toEqual(mockInvoice);
    });

    it('should throw error if upload fails', async () => {
      (fs.mkdir as jest.Mock).mockRejectedValue(new Error('File system error'));

      await expect(service.uploadInvoice(uploadDto, mockFile)).rejects.toThrow(
        'Invoice upload failed',
      );

      expect(mockInvoiceRepository.create).not.toHaveBeenCalled();
      expect(mockKafkaClient.emit).not.toHaveBeenCalled();
    });
  });

  describe('sendInvoice', () => {
    it('should send invoice and update sentAt timestamp', async () => {
      const invoiceId = 'invoice_123';
      const orderId = 'order_123';
      const timestamp = new Date();

      mockInvoiceRepository.findById.mockResolvedValue(mockInvoice);
      mockInvoiceRepository.update.mockResolvedValue({
        ...mockInvoice,
        sentAt: timestamp,
      });

      jest.spyOn(Date, 'now').mockReturnValue(timestamp.getTime());

      await service.sendInvoice(invoiceId, orderId);

      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith(invoiceId);
      expect(mockInvoiceRepository.update).toHaveBeenCalledWith(invoiceId, {
        sentAt: expect.any(Date),
      });
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        OrderInvoiceEvents.INVOICE_SENT,
        {
          invoiceId,
          orderId,
          sentAt: expect.any(Date),
        },
      );
    });

    it('should throw error if invoice not found', async () => {
      const invoiceId = 'invoice_123';
      const orderId = 'order_123';

      mockInvoiceRepository.findById.mockResolvedValue(null);

      await expect(service.sendInvoice(invoiceId, orderId)).rejects.toThrow(
        'Invoice with ID invoice_123 not found',
      );

      expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
      expect(mockKafkaClient.emit).not.toHaveBeenCalled();
    });
  });

  describe('findInvoiceById', () => {
    it('should return invoice by id', async () => {
      const invoiceId = 'invoice_123';
      mockInvoiceRepository.findById.mockResolvedValue(mockInvoice);

      const result = await service.findInvoiceById(invoiceId);

      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith(invoiceId);
      expect(result).toEqual(mockInvoice);
    });

    it('should throw error if invoice not found', async () => {
      const invoiceId = 'invoice_123';
      mockInvoiceRepository.findById.mockResolvedValue(null);

      await expect(service.findInvoiceById(invoiceId)).rejects.toThrow(
        'Invoice with ID invoice_123 not found',
      );
    });
  });

  describe('findInvoiceByOrderId', () => {
    it('should return invoice by order id', async () => {
      const orderId = 'order_123';
      mockInvoiceRepository.findByOrderId.mockResolvedValue(mockInvoice);

      const result = await service.findInvoiceByOrderId(orderId);

      expect(mockInvoiceRepository.findByOrderId).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(mockInvoice);
    });

    it('should throw error if invoice not found', async () => {
      const orderId = 'order_123';
      mockInvoiceRepository.findByOrderId.mockResolvedValue(null);

      await expect(service.findInvoiceByOrderId(orderId)).rejects.toThrow(
        'Invoice for order order_123 not found',
      );
    });
  });
});
