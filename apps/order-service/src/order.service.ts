import { Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from './repositories/order.repository';
import { Order } from './schemas/order.schema';
import {
  OrderCreatedPayload,
  OrderInvoiceEvents,
} from '@libs/kafka/interfaces/order-invoice.interface';
import { OrderStatus } from './dto/order.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientProxy,
  ) {}

  async createOrder(orderData: Partial<Order>) {
    const createdOrder = await this.orderRepository.createOrder(orderData);
    const payload: OrderCreatedPayload = {
      orderId: createdOrder._id as string,
      customerId: createdOrder.customerId,
      sellerId: createdOrder.sellerId,
    };
    this.kafkaClient.emit(OrderInvoiceEvents.ORDER_CREATED, payload);
    return createdOrder;
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

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
  ): Promise<Order | null> {
    const updatedOrder = await this.orderRepository.updateOrder(id, { status });

    if (
      updatedOrder &&
      status === OrderStatus.SHIPPED &&
      updatedOrder.invoiceId
    ) {
      this.publishSendInvoiceEvent(updatedOrder.invoiceId, id);
    }

    return updatedOrder;
  }

  async handleInvoiceUploaded(
    invoiceId: string,
    orderId: string,
  ): Promise<void> {
    const order = await this.orderRepository.findOrderById(orderId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    await this.orderRepository.updateOrder(orderId, { invoiceId });

    console.log(`Handling invoice uploaded for order ${orderId}`);
    if (order.status === OrderStatus.SHIPPED) {
      this.publishSendInvoiceEvent(invoiceId, orderId);
    }
  }

  private publishSendInvoiceEvent(invoiceId: string, orderId: string) {
    const payload = {
      invoiceId,
      orderId,
    };
    this.kafkaClient.emit(OrderInvoiceEvents.INVOICE_SEND, payload);
  }
}
