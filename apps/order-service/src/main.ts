import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:29092'],
      },
      consumer: {
        groupId: 'order-service-group',
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3000);

  if (module.hot) {
    module.hot.accept();

    module.hot.dispose(() => app.close());
  }
}

void bootstrap();
