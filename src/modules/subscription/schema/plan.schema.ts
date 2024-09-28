// Agent.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Document } from 'mongoose';

export type PlanDocument = Document & Plan;

export enum PlanTypeEnum {
  monthly = 'monthly',
  yearly = 'yearly',
}

export enum PlanIntervalEnum {
  month = 'month',
  year = 'year',
}

@Schema({ timestamps: true })
export class Plan {
  @Prop({ type: String, enum: PlanTypeEnum, default: PlanTypeEnum.monthly })
  subscriptionType: PlanTypeEnum;

  @Prop()
  description: string;

  @Prop({
    type: { amount: Number, currency: String },
  })
  price: { amount: number; currency: string };

  @Prop({
    type: String,
    enum: PlanIntervalEnum,
    default: PlanIntervalEnum.month,
  })
  interval: string;

  @Prop({ type: Number, default: 1 })
  duration: number;

  @Prop({ type: Date, default: moment().add(30, 'days').toDate() })
  expiryDate: Date;

  @Prop()
  stripeProductId: string;

  @Prop()
  stripePriceId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
