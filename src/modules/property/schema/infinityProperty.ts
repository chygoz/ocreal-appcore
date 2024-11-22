import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type InfinityPropDocument = InfinityProp & Document;

@Schema()
export class Description {
  @Prop({ required: true })
  dateSeen: Date;

  @Prop({ required: true })
  value: string;
}

@Schema()
export class Feature {
  @Prop({ required: true })
  key: string;

  @Prop({ type: [String], required: true })
  value: string[];

  @Prop()
  replace: string;
}

@Schema()
export class Price {
  @Prop({ required: true })
  amountMax: number;

  @Prop({ required: true })
  amountMin: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ type: [Date], required: true })
  dateSeen: Date[];

  @Prop({ required: true })
  firstDateSeen: Date;

  @Prop({ required: true })
  lastDateSeen: Date;

  @Prop({ required: true })
  availability: string;

  @Prop({ required: true })
  isSold: string;

  @Prop({ required: true })
  pricePerSquareFoot: number;
}

@Schema()
export class Status {
  @Prop({ type: [Date], required: true })
  dateSeen: Date[];

  @Prop({ required: true })
  firstDateSeen: Date;

  @Prop({ required: true })
  lastDateSeen: Date;

  @Prop({ required: true })
  type: string;
}

@Schema({ timestamps: true })
export class InfinityProp {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  dateAdded: Date;

  @Prop({ required: true })
  dateUpdated: Date;

  @Prop({ type: [Description], required: true })
  descriptions: Description[];

  @Prop({ type: [Feature], required: true })
  features: Feature[];

  @Prop()
  floorSizeValue: number;

  @Prop()
  floorSizeUnit: string;

  @Prop({ required: true })
  geoLocation: string;

  @Prop()
  latitude: string;

  @Prop()
  longitude: string;

  @Prop({ required: true })
  mostRecentPriceAmount: number;

  @Prop({ required: true })
  mostRecentPriceDomain: string;

  @Prop()
  mostRecentPriceFirstDateSeen: Date;

  @Prop({ required: true })
  mostRecentStatus: string;

  @Prop({ required: true })
  mostRecentStatusFirstDateSeen: Date;

  @Prop()
  numFloor: number;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ type: [Price], required: true })
  prices: Price[];

  @Prop({ required: true })
  propertyType: string;

  @Prop({ required: true })
  province: string;

  @Prop({ type: [Status], required: true })
  statuses: Status[];

  @Prop()
  yearBuilt: number;

  @Prop({ required: true })
  id: string;
}

export const InfinityPropSchema = SchemaFactory.createForClass(InfinityProp);
