import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrderStatus } from '../dto/order.dto';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({
    required: true,
    default: OrderStatus.CREATED,
    enum: OrderStatus,
    type: String,
  })
  status: OrderStatus;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  sellerId: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
