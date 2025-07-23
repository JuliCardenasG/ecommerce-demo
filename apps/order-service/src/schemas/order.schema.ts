import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum OrderStatus {
  CREATED,
  ACCEPTED,
  REJECTED,
  SHIPPING,
  SHIPPED,
}

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, default: OrderStatus.CREATED, enum: OrderStatus })
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
