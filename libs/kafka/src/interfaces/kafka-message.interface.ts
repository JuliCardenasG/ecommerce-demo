export interface KafkaMessage<T = any> {
  eventId: string;
  eventType: string;
  version: string;
  payload: T;
  timestamp?: number;
  metadata: {
    source: string;
    correlationId?: string;
    retryCount?: number;
  };
}
