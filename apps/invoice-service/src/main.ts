import { NestFactory } from '@nestjs/core';
import { InvoiceServiceModule } from './invoice-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(InvoiceServiceModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:29092'],
      },
      consumer: {
        groupId: 'invoice-consumer',
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
