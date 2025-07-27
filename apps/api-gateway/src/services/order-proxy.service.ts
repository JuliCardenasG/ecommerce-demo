/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderProxyService {
  private readonly orderServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.orderServiceUrl =
      this.configService.get('ORDER_SERVICE_URL') || 'http://localhost:3001';
  }

  async createOrder(orderData: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.orderServiceUrl}`, orderData),
    );
    return response.data;
  }

  async getOrderById(id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.orderServiceUrl}/${id}`),
    );
    return response.data;
  }

  async getAllOrders() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.orderServiceUrl}`),
    );
    return response.data;
  }

  async updateOrder(id: string, updateData: any) {
    const response = await firstValueFrom(
      this.httpService.put(`${this.orderServiceUrl}/${id}`, updateData),
    );
    return response.data;
  }

  async getOrderHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.orderServiceUrl}/health`),
      );
      return { status: 'healthy', service: 'order-service', ...response.data };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'order-service',
        error: error.message,
      };
    }
  }
}
