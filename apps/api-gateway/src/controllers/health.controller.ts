import { Controller, Get } from '@nestjs/common';
import { OrderProxyService } from '../services/order-proxy.service';
import { InvoiceProxyService } from '../services/invoice-proxy.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly orderProxyService: OrderProxyService,
    private readonly invoiceProxyService: InvoiceProxyService,
  ) {}

  @Get()
  async getHealth() {
    const [orderHealth, invoiceHealth] = await Promise.allSettled([
      this.orderProxyService.getOrderHealth(),
      this.invoiceProxyService.getInvoiceHealth(),
    ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        'order-service':
          orderHealth.status === 'fulfilled'
            ? orderHealth.value
            : { status: 'unhealthy', error: orderHealth.reason?.message },
        'invoice-service':
          invoiceHealth.status === 'fulfilled'
            ? invoiceHealth.value
            : { status: 'unhealthy', error: invoiceHealth.reason?.message },
      },
    };
  }

  @Get('gateway')
  getGatewayHealth() {
    return {
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
