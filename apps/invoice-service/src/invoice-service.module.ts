import { Module } from '@nestjs/common';
import { InvoiceServiceController } from './invoice-service.controller';
import { InvoiceService } from './invoice-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { InvoiceRepository } from './repositories/invoice.repository';

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
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
  ],
  controllers: [InvoiceServiceController],
  providers: [InvoiceService, InvoiceRepository],
})
export class InvoiceServiceModule {}
