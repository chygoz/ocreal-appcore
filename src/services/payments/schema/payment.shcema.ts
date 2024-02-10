// user.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schema/user.schema';

export enum PaymentTypeEnum {
  subscription = 'subscription',
}

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop()
  receiptUrl: string;

  @Prop()
  stripeInvoiceId: string;

  @Prop({
    type: {
      amount: String,
      currency: String,
    },
  })
  amount: {
    amount: string;
    currency: string;
  };

  @Prop({ type: String, enum: Object.values(PaymentTypeEnum) })
  paymentType: PaymentTypeEnum;

  @Prop({ type: String })
  reference: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
