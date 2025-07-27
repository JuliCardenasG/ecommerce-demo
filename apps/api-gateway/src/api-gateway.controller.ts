/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrderProxyService } from './services/order-proxy.service';
import { InvoiceProxyService } from './services/invoice-proxy.service';

@Controller()
export class ApiGatewayController {
  constructor(
    private readonly orderProxyService: OrderProxyService,
    private readonly invoiceProxyService: InvoiceProxyService,
  ) {}

  @Post('orders')
  async createOrder(@Body() createOrderDto: any) {
    try {
      return await this.orderProxyService.createOrder(createOrderDto);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Order service unavailable',
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('orders')
  async getAllOrders() {
    try {
      return await this.orderProxyService.getAllOrders();
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Order service unavailable',
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    try {
      return await this.orderProxyService.getOrderById(id);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Order service unavailable',
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Put('orders/:id')
  async updateOrder(@Param('id') id: string, @Body() updateOrderDto: any) {
    try {
      return await this.orderProxyService.updateOrder(id, updateOrderDto);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Order service unavailable',
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post('invoices')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvoice(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([file.buffer]), file.originalname);
      formData.append('orderId', body.orderId);
      formData.append('sellerId', body.sellerId);

      return await this.invoiceProxyService.uploadInvoice(formData);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Invoice service unavailable',
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('invoices/:id')
  async getInvoiceById(@Param('id') id: string) {
    try {
      return await this.invoiceProxyService.getInvoiceById(id);
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Invoice service unavailable',
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
