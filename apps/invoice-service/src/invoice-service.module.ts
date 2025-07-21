import { Module } from '@nestjs/common';
import { InvoiceServiceController } from './invoice-service.controller';
import { InvoiceServiceService } from './invoice-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('INVOICE_SERVICE_DB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [InvoiceServiceController],
  providers: [InvoiceServiceService],
})
export class InvoiceServiceModule {}
