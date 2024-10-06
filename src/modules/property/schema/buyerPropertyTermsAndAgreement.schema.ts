import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Property } from './property.schema';
import { User } from 'src/modules/users/schema/user.schema';

@Schema({ timestamps: true })
export class BuyerProperyTermsAndAgreement extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true, type: Boolean, default: false })
  accepted: boolean;

  @Prop({ type: Date, required: true, default: Date.now })
  acceptedAt: Date;

  @Prop({ type: String, required: true })
  ipAddress: string;

  @Prop({ type: String })
  listingId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property' })
  property: Property;

  @Prop({ type: String, required: true })
  termsVersion: string;

  @Prop({ type: String, default: null })
  location: string;
}

export const BuyerProperyTermsAndAgreementSchema = SchemaFactory.createForClass(
  BuyerProperyTermsAndAgreement,
);
