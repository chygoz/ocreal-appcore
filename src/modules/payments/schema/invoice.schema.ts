import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export enum PayerTypeEnum {
  user = 'User',
  agent = 'Agent',
}

export enum PaymentStatus {
  pending = 'Pending',
  paid = 'Paid',
  failed = 'Failed',
  cancelled = 'Cancelled',
  expired = 'Expired',
}
@Schema({ timestamps: true, versionKey: false })
export class Invoice extends Document {
  @Prop({
    type: SchemaTypes.ObjectId,
    refPath: 'payeeType',
    required: true,
  })
  payee: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property' })
  property: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Payment' })
  payment: string;

  @Prop({ type: String, required: true, enum: PayerTypeEnum })
  payeeType: string;

  @Prop({ type: String, required: true, unique: true, trim: true })
  reference: string;

  @Prop({ type: Date, default: new Date() })
  paymentDate: Date;

  @Prop({ type: Date })
  dueDate: Date;

  @Prop({ type: Number, required: true, min: 0 })
  totalAmount: number;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.pending,
  })
  paymentStatus: string;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.pending,
  })
  paymentReason: string;

  @Prop({ type: String, trim: true })
  notes: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
