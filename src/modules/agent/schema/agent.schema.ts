// Agent.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from '../../users/schema/user.schema';
// import * as moment from 'moment';

export type AgentDocument = HydratedDocument<Agent>;

@Schema({ timestamps: true })
export class Agent extends Document {
  @Prop({ unique: true, trim: true, required: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  fullname: string;

  @Prop({
    type: { type: SchemaTypes.ObjectId, ref: 'User' },
    default: [],
  })
  connectedUsers: User[];

  @Prop({
    type: { type: SchemaTypes.ObjectId, ref: 'User' },
  })
  invitedBy?: User;

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

  @Prop()
  licence_number: string;

  @Prop()
  region?: string;

  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop({ type: Boolean, default: false })
  emailVerified: false;

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

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);