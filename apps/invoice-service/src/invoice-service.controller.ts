import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipeBuilder,
  HttpStatus,
  Param,
  Get,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InvoiceService } from './invoice.service';
import { UploadInvoiceDto } from './dto/invoice.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  InvoiceSendPayload,
  OrderInvoiceEvents,
} from '@libs/kafka/interfaces/order-invoice.interface';

@Controller()
export class InvoiceServiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('/health')
  getHealth() {
    return {
      status: 'healthy',
      service: 'invoice-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvoice(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'pdf',
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
          message: 'File size must not exceed 10MB',
        })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
    @Body() body: UploadInvoiceDto,
  ) {
    if (!file) {
      throw new BadRequestException('Invoice file is required');
    }

    try {
      const uploadInvoiceData = await this.invoiceService.uploadInvoice(
        body,
        file,
      );
      return {
        data: uploadInvoiceData,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload invoice: ${error.message}`,
      );
    }
  }

  @Get('/:invoiceId')
  async findInvoiceById(@Param('invoiceId') id: string) {
    return this.invoiceService.findInvoiceById(id);
  }

  @Get('/order/:orderId')
  async findInvoiceByOrderId(@Param('orderId') orderId: string) {
    return this.invoiceService.findInvoiceByOrderId(orderId);
  }

  @MessagePattern(OrderInvoiceEvents.INVOICE_SEND)
  async handleInvoiceSend(@Payload() data: InvoiceSendPayload) {
    await this.invoiceService.sendInvoice(data.invoiceId, data.orderId);
  }
}
