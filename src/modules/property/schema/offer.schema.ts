import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';
import { Property } from './property.schema';

export interface Price {
  amount: number;
  currency: string;
}

export enum OfferStatusEnum {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
}

export enum FinanceTypeEnum {
  loan = 'loan',
  cash = 'cash',
  contingent = 'contingent',
}

@Schema({ timestamps: true, versionKey: false })
export class Offer extends Document {
  @Prop([
    {
      status: {
        type: SchemaTypes.String,
        enum: Object.values(OfferStatusEnum),
      },
      eventTime: SchemaTypes.Date,
    },
  ])
  status: {
    status: OfferStatusEnum;
    eventTime: Date;
  }[];

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(OfferStatusEnum),
    default: OfferStatusEnum.pending,
  })
  currentStatus: Property;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(OfferStatusEnum),
  })
  financeType: FinanceTypeEnum;

  @Prop({
    type: SchemaTypes.Boolean,
    default: false,
  })
  apprasalContingency: boolean;

  @Prop({
    type: SchemaTypes.Mixed,
  })
  offerPrice: {
    amount: number;
    currency: string;
  };

  @Prop({
    type: SchemaTypes.Mixed,
  })
  downPayment: {
    amount: number;
    currency: string;
  };

  @Prop({
    type: SchemaTypes.Mixed,
  })
  loanAmount: {
    amount: number;
    currency: string;
  };

  @Prop({
    type: SchemaTypes.Boolean,
    default: false,
  })
  inspectionContingency: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property' })
  property: Property;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  buyer: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  seller: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  sellerAgent: Agent;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  buyerAgent: Agent;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
