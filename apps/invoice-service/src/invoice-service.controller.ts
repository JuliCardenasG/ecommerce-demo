import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { InvoiceService } from './invoice-service.service';
import { UploadInvoiceDto } from './dto/invoice.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class InvoiceServiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

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
}
