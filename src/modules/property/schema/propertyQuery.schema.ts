import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface Broker {
  agent: string;
  company: string;
  dateSeen: Date[];
}

export interface Feature {
  key: string;
  value: string[];
}

export interface Price {
  amountMax: number;
  amountMin: number;
  currency: string;
  dateSeen: Date[];
  isSale?: boolean;
}

export interface PropertyTax {
  amount: number;
  currency: string;
  dateSeen: Date[];
}

export interface Status {
  dateSeen: Date[];
  isUnderContract: boolean;
  type: string;
}

@Schema()
export class PropertyQuery extends Document {
  @Prop()
  address: string;

  @Prop({ type: [Object] })
  brokers: Broker[];

  @Prop()
  city: string;

  @Prop()
  country: string;

  @Prop()
  dateAdded: Date;

  @Prop({ type: [Object] })
  features: Feature[];

  @Prop()
  latitude: string;

  @Prop()
  listingName: string;

  @Prop()
  longitude: string;

  @Prop()
  lotSizeValue: number;

  @Prop()
  lotSizeUnit: string;

  @Prop()
  mlsNumber: string;

  @Prop()
  numBathroom: number;

  @Prop()
  numBedroom: number;

  @Prop()
  postalCode: string;

  @Prop({ type: [Object] })
  prices: Price[];

  @Prop({ type: [Object] })
  propertyTaxes: PropertyTax[];

  @Prop()
  propertyType: string;

  @Prop()
  province: string;

  @Prop({ type: [Object] })
  statuses: Status[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PropertyQuerySchema = SchemaFactory.createForClass(PropertyQuery);
