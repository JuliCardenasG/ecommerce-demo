/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InvoiceProxyService {
  private readonly invoiceServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.invoiceServiceUrl =
      this.configService.get('INVOICE_SERVICE_URL') || 'http://localhost:3002';
  }

  async uploadInvoice(formData: FormData) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.invoiceServiceUrl}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );
    return response.data;
  }

  async getInvoiceById(id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.invoiceServiceUrl}/${id}`),
    );
    return response.data;
  }

  async getInvoiceHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.invoiceServiceUrl}/health`),
      );
      return {
        status: 'healthy',
        service: 'invoice-service',
        ...response.data,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'invoice-service',
        error: error.message,
      };
    }
  }
}
