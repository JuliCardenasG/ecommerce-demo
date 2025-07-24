import { Injectable } from '@nestjs/common';
import { OrderRepository } from './repositories/order.repository';
import { Order } from './schemas/order.schema';
import { KafkaMessage } from '@libs/kafka/interfaces/kafka-message.interface';
import { KafkaService } from '@libs/kafka';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly kafkaService: KafkaService,
  ) {}

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

  async testKafkaPublish() {
    const testEvent: KafkaMessage<{ orderId: string; status: string }> = {
      eventId: `test-${Date.now()}`,
      eventType: 'ORDER_STATUS_TEST',
      version: '1.0',
      payload: {
        orderId: 'test-order-123',
        status: 'SHIPPED',
      },
      metadata: {
        source: 'order-service',
        correlationId: `test-correlation-${Date.now()}`,
      },
    };

    await this.kafkaService.publishEvent('order-events', testEvent);
    return { message: 'Test event published' };
  }

  async testKafkaSubscription() {
    await this.kafkaService.subscribeToTopic<{
      orderId: string;
      status: string;
    }>('order-events', (message) => {
      console.log('Received order event:', {
        eventId: message.eventId,
        eventType: message.eventType,
        orderId: message.payload.orderId,
        status: message.payload.status,
        source: message.metadata.source,
      });

      // Handle different event types
      switch (message.eventType) {
        case 'ORDER_STATUS_TEST':
          console.log('Processing test order status event');
          break;
        case 'ORDER_CREATED':
          console.log('Processing order created event');
          break;
        case 'ORDER_UPDATED':
          console.log('Processing order updated event');
          break;
        default:
          console.log('Unknown event type:', message.eventType);
      }

      return Promise.resolve();
    });
    return { message: 'Subscribed to order-events topic' };
  }
}
