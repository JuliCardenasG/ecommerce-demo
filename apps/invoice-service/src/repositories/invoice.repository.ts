import { Injectable } from '@nestjs/common';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async create(invoiceData: Partial<Invoice>): Promise<InvoiceDocument> {
    const invoice = new this.invoiceModel(invoiceData);
    return invoice.save();
  }

  async findById(id: string): Promise<InvoiceDocument | null> {
    return this.invoiceModel.findById(id).exec();
  }

  async findByOrderId(orderId: string): Promise<InvoiceDocument | null> {
    return this.invoiceModel.findOne({ orderId }).exec();
  }

  async findAll(): Promise<InvoiceDocument[]> {
    return this.invoiceModel.find().exec();
  }

  async update(
    id: string,
    updateData: Partial<Invoice>,
  ): Promise<InvoiceDocument | null> {
    return this.invoiceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<InvoiceDocument | null> {
    return this.invoiceModel.findByIdAndDelete(id).exec();
  }
}
