import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Model } from 'mongoose';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const createdOrder = new this.orderModel(orderData);
    return createdOrder.save();
  }

  async findOrderById(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).exec();
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  async updateOrder(
    id: string,
    updateData: Partial<Order>,
  ): Promise<Order | null> {
    return this.orderModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteOrder(id: string): Promise<Order | null> {
    return this.orderModel.findByIdAndDelete(id).exec();
  }
}
