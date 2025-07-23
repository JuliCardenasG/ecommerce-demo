import { Injectable } from '@nestjs/common';
import { OrderRepository } from './repositories/order.repository';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  createOrder(orderData: Partial<Order>): Promise<Order> {
    return this.orderRepository.createOrder(orderData);
  }

  findAllOrders(): Promise<Order[]> {
    return this.orderRepository.findAllOrders();
  }

  findOrderById(id: string): Promise<Order | null> {
    return this.orderRepository.findOrderById(id);
  }

  updateOrder(id: string, updateData: Partial<Order>): Promise<Order | null> {
    return this.orderRepository.updateOrder(id, updateData);
  }
}
