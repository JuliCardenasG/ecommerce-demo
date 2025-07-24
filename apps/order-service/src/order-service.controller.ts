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
import { OrderService } from './order-service.service';
import { ZodValidationPipe } from '@libs/validation';
import {
  CreateOrderDto,
  createOrderDto,
  UpdateOrderDto,
  updateOrderDto,
} from './dto/order.dto';

@Controller('orders')
export class OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  @Get('test-kafka')
  async testKafkaPublish() {
    const result = await this.orderService.testKafkaPublish();
    return { data: result };
  }

  @Get('test-kafka-subscription')
  async testKafkaSubscription() {
    const result = await this.orderService.testKafkaSubscription();
    return { data: result };
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
    const updatedOrder = await this.orderService.updateOrder(
      id,
      updateOrderDto,
    );
    return { data: updatedOrder };
  }
}
