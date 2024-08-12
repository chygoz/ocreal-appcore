import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';
import { PropertyDocumentRepo } from '../../propertyRepo/schema/propertyDocumentRepo.schema';
// import * as mongoose from 'mongoose';

export interface Price {
  amount: number;
  currency: string;
}

export enum PropertyStatusEnum {
  pendingVerification = 'Pending Verification',
  properyOwnershipVerified = 'Verified',
  notVerified = 'Not Verified',
  nowShowing = 'Now Showing',
  underContract = 'Under Contract',
  sold = 'Sold',
  buyerAgentAdded = 'Buyer Agent Added',
  buyerAgentAcceptedInvite = 'Buyer Agent Accepted Invite',
  sellerAgentAcceptedInvite = 'Seller Agent Accepted Invite',
  sellerAgentAdded = 'Seller Agent Added',
  unpublished = 'Unpublished',
}

export interface PropertyTax {
  amount: number;
  currency: string;
  dateSeen: Date[];
}

export interface Status {
  eventTime: Date;
  status: boolean;
}
export interface IPropertyImage {
  url: string;
  thumbNail: string;
}
export interface IPropertyVideo {
  url: string;
  thumbNail: string;
}

@Schema({ timestamps: true, versionKey: false })
export class Property extends Document {
  @Prop({
    type: SchemaTypes.Mixed,
    _id: false,
  })
  propertyAddressDetails: {
    formattedAddress?: string;
    placeId?: string;
    streetNumber?: string;
    streetName?: string;
    city: string;
    province?: string;
    state: string;
    postalCode?: string;
    country?: string;
  };

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isDeleted: boolean;

  @Prop([{ url: SchemaTypes.String, thumbNail: SchemaTypes.String }])
  images: Array<IPropertyImage>;

  @Prop([{ url: SchemaTypes.String, thumbNail: SchemaTypes.String }])
  videos: Array<IPropertyVideo>;

  @Prop([
    {
      agent: { type: SchemaTypes.ObjectId, ref: 'Agent' },
      role: String,
    },
  ])
  brokers: Array<{
    agent: Agent;
    role: string;
  }>;

  @Prop()
  dateAdded: Date;

  @Prop([
    {
      feature: SchemaTypes.String,
      icon: SchemaTypes.String,
      description: SchemaTypes.String,
    },
  ])
  features: Array<{ feature: string; icon: string; description: string }>;

  @Prop()
  latitude: string;

  @Prop({
    type: SchemaTypes.Boolean,
    default: false,
  })
  listed: boolean;

  @Prop()
  propertyName: string;

  @Prop()
  propertyDescription: string;

  @Prop({
    type: SchemaTypes.String,
    default: PropertyStatusEnum.pendingVerification,
  })
  currentStatus: string;

  @Prop()
  longitude: string;

  @Prop()
  lotSizeValue: string;

  @Prop()
  lotSizeUnit: string;

  @Prop()
  numBathroom: string;

  @Prop()
  numBedroom: string;

  @Prop({
    type: SchemaTypes.Mixed,
  })
  price: { amount: number; currency: string };

  @Prop({
    type: {
      nameOnProperty: SchemaTypes.String,
      email: SchemaTypes.String,
      actionTime: SchemaTypes.Date,
    },
  })
  propertyOwnershipDetails: {
    nameOnProperty: string;
    email: string;
    actionTime: Date;
  };

  @Prop({
    type: SchemaTypes.String,
  })
  yearBuilt: string;

  @Prop([
    {
      amount: SchemaTypes.Number,
      currency: SchemaTypes.String,
      dateSeen: [{ type: SchemaTypes.Date }],
    },
  ])
  propertyTaxes: Array<PropertyTax>;

  @Prop()
  propertyType: string;

  @Prop([
    {
      status: {
        type: SchemaTypes.String,
        enum: Object.values(PropertyStatusEnum),
      },
      eventTime: SchemaTypes.Date,
    },
  ])
  status: {
    status: PropertyStatusEnum;
    eventTime: Date;
  }[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  buyer: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  seller: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  sellerAgent: Agent;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  buyerAgent: Agent;

  @Prop({ type: SchemaTypes.ObjectId, ref: PropertyDocumentRepo.name })
  documentRepo: PropertyDocumentRepo;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  sellerAgentAcceptance: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  buyerAgentAcceptance: boolean;

  @Prop({ type: SchemaTypes.Number, default: 0 })
  viewsCounter: number;

  @Prop({ type: SchemaTypes.Number, default: 0 })
  shareCounter: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
