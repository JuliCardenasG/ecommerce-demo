import { Controller, Get, Post, Body } from '@nestjs/common';
import { OrderServiceService } from './order-service.service';
import { ZodValidationPipe } from '@libs/validation';
import { CreateOrderDto, createOrderDto } from './dto/order.dto';

@Controller('orders')
export class OrderServiceController {
  constructor(private readonly orderServiceService: OrderServiceService) {}

  @Get()
  getHello(): string {
    return this.orderServiceService.getHello();
  }

  @Post()
  createOrder(
    @Body(new ZodValidationPipe(createOrderDto))
    createOrderDto: CreateOrderDto,
  ) {
    return {
      message: 'Order created successfully',
      data: createOrderDto,
    };
  }
}
