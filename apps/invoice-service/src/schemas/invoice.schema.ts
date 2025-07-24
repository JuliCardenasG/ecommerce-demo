import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Invoice {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  sellerId: string;

  @Prop({ required: true })
  pdfPath: string;

  @Prop({ required: true })
  uploadedAt: Date;

  sentAt: Date;
}
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

export type InvoiceDocument = Invoice & Document;
