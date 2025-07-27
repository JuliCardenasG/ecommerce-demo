import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceServiceController } from './invoice-service.controller';
import { InvoiceService } from './invoice.service';

describe('InvoiceServiceController', () => {
  let invoiceServiceController: InvoiceServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceServiceController],
      providers: [InvoiceService],
    }).compile();

    invoiceServiceController = app.get<InvoiceServiceController>(
      InvoiceServiceController,
    );
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(invoiceServiceController).toBeDefined();
    });
  });
});
