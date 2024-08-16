// Agent.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from '../../users/schema/user.schema';
import { Agent } from 'http';
import { Property } from './property.schema';

// import * as moment from 'moment';

export type SharePropertyDocDocument = HydratedDocument<SharePropertyDoc>;

@Schema({ timestamps: true })
export class SharePropertyDoc extends Document {
  @Prop()
  role: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  message: string;

  @Prop({ select: false })
  shareToken: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property' })
  property: Property;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  seller: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  sellerAgent: Agent;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SharePropertyDocSchema =
  SchemaFactory.createForClass(SharePropertyDoc);
