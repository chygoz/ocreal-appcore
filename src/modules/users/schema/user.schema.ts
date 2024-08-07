// user.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes } from 'mongoose';
import { AccountTypeEnum } from 'src/constants';
import { UserDocument as UserOfficialDocument } from './user_documents';
// import * as moment from 'moment';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ unique: true, trim: true, lowercase: true })
  facebookId?: string;

  @Prop({
    type: {
      propertyType: { type: SchemaTypes.String },
      preferredPropertyAddress: { type: SchemaTypes.String },
      onboardingCompleted: { type: SchemaTypes.Boolean, default: false },
      spendAmount: { type: SchemaTypes.Mixed },
      financialProcess: { type: SchemaTypes.String },
      preApprovalAffiliates: { type: SchemaTypes.Boolean, default: false },
      workWithLender: { type: SchemaTypes.Boolean, default: false },
    },
    _id: false,
  })
  propertyPreference: {
    propertyType: string;
    preferredPropertyAddress: string;
    onboardingCompleted: boolean;
    spendAmount: {
      min: number;
      max: number;
    };
    financialProcess: string;
    preApprovalAffiliates: boolean;
    workWithLender: boolean;
  };

  @Prop({ type: SchemaTypes.ObjectId, ref: UserOfficialDocument.name })
  documents: UserOfficialDocument;

  @Prop({ select: false })
  password: string;

  @Prop()
  fullname: string;

  @Prop()
  socketId: string;

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
