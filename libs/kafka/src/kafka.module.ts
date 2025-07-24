import { DynamicModule, Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { createKafkaConfig } from './config/kafka.config';

@Module({})
export class KafkaModule {
  static register(groupId: string): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        KafkaService,
        {
          provide: 'KAFKA_CONFIG',
          useFactory: () => createKafkaConfig(groupId),
        },
      ],
      exports: [KafkaService],
    };
  }
}
