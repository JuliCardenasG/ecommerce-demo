import { Injectable } from '@nestjs/common';
import { InvoiceRepository } from './repositories/invoice.repository';
import { UploadInvoiceDto } from './dto/invoice.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class InvoiceService {
  private readonly uploadDir = '/app/uploads/invoices';
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async uploadInvoice(uploadData: UploadInvoiceDto, file: Express.Multer.File) {
    const savedUrlPath = await this.saveFileToStorage(
      file,
      uploadData.sellerId,
      uploadData.orderId,
    );
    return this.invoiceRepository.create({
      orderId: uploadData.orderId,
      sellerId: uploadData.sellerId,
      uploadedAt: new Date(),
      pdfPath: savedUrlPath,
    });
    // TODO: Send Kafka message to notify other services
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
}
