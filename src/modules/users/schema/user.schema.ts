// user.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes } from 'mongoose';
import { AccountTypeEnum } from 'src/constants';
// import * as moment from 'moment';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, trim: true, required: true, lowercase: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop()
  fullname: string;

  @Prop({
    type: {
      number_body: String,
      mobile_extension: String,
      raw_mobile: String,
    },
  })
  mobile: {
    number_body: string;
    mobile_extension: string;
    raw_mobile: string;
  };

  @Prop({
    type: Boolean,
    default: false,
  })
  preApproval: boolean;

  @Prop({
    type: SchemaTypes.Mixed,
  })
  preApprovalDocument: {
    url: string;
    expiryDate: Date;
  };

  @Prop()
  firstname: string;

  @Prop()
  stripe_customer_id: string;

  @Prop()
  lastname: string;

  @Prop()
  verification_code: string;

  @Prop({ type: Date })
  token_expiry_time: Date;

  @Prop({ type: Boolean, default: false })
  emailVerified: false;

  @Prop({ type: String, enum: Object.values(AccountTypeEnum) })
  account_type: AccountTypeEnum;

  @Prop({
    type: {
      lat: Number,
      lng: Number,
      address: String,
      details: [],
      country: String,
      city: String,
    },
  })
  address: {
    lat: number;
    lng: number;
    address: string;
    details: [];
    country: string;
    city: string;
  };

  @Prop({
    type: {
      connected_apps: {
        apple: Object,
        google: Object,
        facebook: Object,
        docuSign: Object,
      },
    },
  })
  connected_apps: {
    apple: object;
    google: object;
    facebook: object;
    docuSign: object;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
