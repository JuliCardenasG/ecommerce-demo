import { Inject, Injectable } from '@nestjs/common';
import { Consumer, Kafka, Producer } from 'kafkajs';
import { KafkaConfig } from './config/kafka.config';
import { KafkaMessage } from './interfaces/kafka-message.interface';

@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(
    @Inject('KAFKA_CONFIG') private readonly kafkaConfig: KafkaConfig,
  ) {
    this.kafka = new Kafka({
      clientId: this.kafkaConfig.clientId,
      brokers: this.kafkaConfig.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 5,
      },
    });
  }

  async onModuleInit() {
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: this.kafkaConfig.groupId,
      sessionTimeout: 45000,
      heartbeatInterval: 3000,
    });

    await this.producer.connect();
    await this.consumer.connect();
  }

  async publishEvent<T>(topic: string, event: KafkaMessage<T>) {
    try {
      console.log('Publishing event:', { event });
      const message = {
        key: event.eventId,
        value: JSON.stringify(event),
        timestamp: new Date().getTime(),
      };

      await this.producer.send({
        topic,
        messages: [message],
      });
    } catch (error) {
      console.error('Error publishing event:', error);
    }
  }

  async subscribeToTopic<T>(
    topic: string,
    handler: (message: KafkaMessage<T>) => Promise<void>,
  ) {
    await this.consumer.subscribe({ topic, fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          if (message.value !== null) {
            const parsedMessage: KafkaMessage<T> = JSON.parse(
              message.value.toString(),
            );
            await handler(parsedMessage);
          }
        } catch (error) {
          console.error('Error processing message:', error);
          // TODO: DLQ implementation?
        }
      },
    });
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      console.log('Kafka connections closed');
    } catch (error) {
      console.error('Error disconnecting Kafka:', error);
    }
  }
}
