import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InvoiceRepository } from './repositories/invoice.repository';
import { UploadInvoiceDto } from './dto/invoice.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { OrderInvoiceEvents } from '@libs/kafka/interfaces/order-invoice.interface';

@Injectable()
export class InvoiceService {
  private readonly uploadDir = '/app/uploads/invoices';
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientProxy,
  ) {}

  async uploadInvoice(uploadData: UploadInvoiceDto, file: Express.Multer.File) {
    // In a real application, we would need to validate the order and seller IDs
    try {
      const savedUrlPath = await this.saveFileToStorage(
        file,
        uploadData.sellerId,
        uploadData.orderId,
      );
      const invoice = await this.invoiceRepository.create({
        orderId: uploadData.orderId,
        sellerId: uploadData.sellerId,
        uploadedAt: new Date(),
        pdfPath: savedUrlPath,
      });

      this.publishInvoiceUploadedEvent(
        invoice._id as string,
        uploadData.orderId,
      );

      return invoice;
    } catch (error) {
      console.error('Error uploading invoice:', error);
      throw new Error('Invoice upload failed');
    }
  }

  async sendInvoice(invoiceId: string, orderId: string) {
    console.log(`Sending invoice ${invoiceId} for order ${orderId}`);
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice with ID ${invoiceId} not found`);
    }
    const timestamp = new Date();
    await this.invoiceRepository.update(invoiceId, {
      sentAt: timestamp,
    });
    this.publishInvoiceSentEvent(invoiceId, orderId);
  }

  async findInvoiceById(id: string) {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async findInvoiceByOrderId(orderId: string) {
    const invoice = await this.invoiceRepository.findByOrderId(orderId);
    if (!invoice) {
      throw new Error(`Invoice for order ${orderId} not found`);
    }
    return invoice;
  }

  private async saveFileToStorage(
    file: Express.Multer.File,
    sellerId: string,
    orderId: string,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }
    const timestamp = new Date().toISOString();
    const dirPath = path.join(this.uploadDir, sellerId, orderId);
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, `${timestamp}-${file.originalname}`);
    await fs.writeFile(filePath, file.buffer);
    return filePath;
  }

  private publishInvoiceUploadedEvent(invoiceId: string, orderId: string) {
    const payload = {
      invoiceId,
      orderId,
    };
    this.kafkaClient.emit(OrderInvoiceEvents.INVOICE_UPLOADED, payload);
  }

  private publishInvoiceSentEvent(invoiceId: string, orderId: string) {
    const payload = {
      invoiceId,
      orderId,
      sentAt: new Date(),
    };
    this.kafkaClient.emit(OrderInvoiceEvents.INVOICE_SENT, payload);
  }
}
