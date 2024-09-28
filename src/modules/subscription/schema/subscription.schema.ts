// Agent.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from '../../users/schema/user.schema';
import { Plan, PlanTypeEnum } from './plan.schema';
import { Invoice } from 'src/modules/payments/schema/invoice.schema';
import { Agent } from 'src/modules/agent/schema/agent.schema';
// import * as moment from 'moment';

export enum SubscriptionStatusEnum {
  active = 'active',
  inactive = 'inactive',
  canceled = 'canceled',
  past_due = 'past_due',
  unpaid = 'unpaid',
}

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop()
  stripe_subscription_id: string;

  @Prop({
    type: String,
    enum: PlanTypeEnum,
    default: PlanTypeEnum.monthly,
  })
  subcriptionType: PlanTypeEnum;

  @Prop({
    type: SchemaTypes.String,
    required: true,
    enum: SubscriptionStatusEnum,
    default: SubscriptionStatusEnum.active,
  })
  status: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent', required: true })
  agent: Agent;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Invoice' })
  invoice: Invoice;

  @Prop({ required: true, type: SchemaTypes.String })
  planId: string;

  @Prop({ required: true, type: SchemaTypes.Date })
  currentPeriodStart: Date;

  @Prop({ required: true, type: SchemaTypes.Date })
  currentPeriodEnd: Date;

  @Prop({ required: false, type: SchemaTypes.Date })
  canceledAt?: Date;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  autoRenew: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Plan', required: true })
  plan: Plan;

  @Prop({ type: SchemaTypes.Date })
  expiryDate: Date;

  @Prop({ type: SchemaTypes.Boolean, default: true })
  active: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  canceled: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
