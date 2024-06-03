// src/schemas/property-document.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schema/user.schema';

@Schema()
export class UserDocument extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: SchemaTypes.String })
  name: string;

  @Prop({ type: SchemaTypes.String })
  url: string;

  @Prop({ type: SchemaTypes.String })
  thumbNail: string;

  @Prop({ type: SchemaTypes.String })
  documentType: string;

  @Prop({ type: SchemaTypes.Date })
  expirydate: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserDocumentSchema = SchemaFactory.createForClass(UserDocument);
