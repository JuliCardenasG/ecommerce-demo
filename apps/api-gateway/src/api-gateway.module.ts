import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ApiGatewayController } from './api-gateway.controller';
import { OrderProxyService } from './services/order-proxy.service';
import { InvoiceProxyService } from './services/invoice-proxy.service';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
  ],
  controllers: [ApiGatewayController, HealthController],
  providers: [OrderProxyService, InvoiceProxyService],
})
export class ApiGatewayModule {}
