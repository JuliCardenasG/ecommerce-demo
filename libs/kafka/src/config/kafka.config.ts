export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
  topics: {
    orderEvents: string;
    invoiceEvents: string;
  };
}

export const createKafkaConfig = (groupId: string): KafkaConfig => ({
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  clientId: process.env.KAFKA_CLIENT_ID || 'ecommerce-demo',
  groupId,
  topics: {
    orderEvents: process.env.KAFKA_TOPIC_ORDER_EVENTS || 'order-events',
    invoiceEvents: process.env.KAFKA_TOPIC_INVOICE_EVENTS || 'invoice-events',
  },
});
