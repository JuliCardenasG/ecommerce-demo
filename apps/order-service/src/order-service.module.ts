import { Module } from '@nestjs/common';
import { OrderServiceController } from './order-service.controller';
import { OrderService } from './order-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderRepository } from './repositories/order.repository';
import { Order, OrderSchema } from './schemas/order.schema';
import { KafkaModule } from '@libs/kafka';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('ORDER_SERVICE_DB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    KafkaModule.register('order-service-group'),
  ],
  controllers: [OrderServiceController],
  providers: [OrderService, OrderRepository],
})
export class OrderServiceModule {}
