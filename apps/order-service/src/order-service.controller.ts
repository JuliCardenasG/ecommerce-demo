import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { ZodValidationPipe } from '@libs/validation';
import {
  CreateOrderDto,
  createOrderDto,
  UpdateOrderDto,
  updateOrderDto,
} from './dto/order.dto';
import {
  InvoiceUploadedPayload,
  OrderInvoiceEvents,
} from '@libs/kafka/interfaces/order-invoice.interface';

@Controller('')
export class OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/health')
  getHealth() {
    return {
      status: 'healthy',
      service: 'order-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.orderService.findOrderById(id);
    return { data: order };
  }

  @Get()
  async getAllOrders() {
    const orders = await this.orderService.findAllOrders();
    return { data: orders };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Body(new ZodValidationPipe(createOrderDto))
    createOrderDto: CreateOrderDto,
  ) {
    const createdOrder = await this.orderService.createOrder(createOrderDto);

    return { data: createdOrder };
  }

  @Put(':id')
  async updateOrder(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateOrderDto)) updateOrderDto: UpdateOrderDto,
  ) {
    let updatedOrder;

    if (updateOrderDto.status) {
      updatedOrder = await this.orderService.updateOrderStatus(
        id,
        updateOrderDto.status,
      );
    } else {
      updatedOrder = await this.orderService.updateOrder(id, updateOrderDto);
    }

    return { data: updatedOrder };
  }

  @MessagePattern(OrderInvoiceEvents.INVOICE_UPLOADED)
  async handleInvoiceUploaded(@Payload() data: InvoiceUploadedPayload) {
    await this.orderService.handleInvoiceUploaded(data.invoiceId, data.orderId);
  }
}
