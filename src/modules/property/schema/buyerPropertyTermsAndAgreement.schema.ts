import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true })
export class BuyerProperyTermsAndAgreement extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: string;

  @Prop({ required: true, type: Boolean, default: false })
  accepted: boolean;

  @Prop({ type: Date, required: true, default: Date.now })
  acceptedAt: Date;

  @Prop({ type: String, required: true })
  ipAddress: string;

  @Prop({ type: String, required: true })
  listingId: string;

  @Prop({ type: String, required: true })
  termsVersion: string;

  @Prop({ type: String, default: null })
  location: string;
}

export const BuyerProperyTermsAndAgreementSchema = SchemaFactory.createForClass(
  BuyerProperyTermsAndAgreement,
);
