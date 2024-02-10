// Agent.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from '../../users/schema/user.schema';
import { Plan, PlanTypeEnum } from './plan.schema';
// import * as moment from 'moment';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop()
  stripe_subscription_id: string;

  @Prop({
    type: String,
    enum: PlanTypeEnum,
    default: PlanTypeEnum.freemium,
  })
  subcriptionType: PlanTypeEnum;

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
