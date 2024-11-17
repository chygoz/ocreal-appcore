import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export enum NotificationUserType {
  agent = 'Agent',
  user = 'User',
}

export type NotificationDocument = Notification & Document;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  user: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: false })
  agent: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false })
  admin: string;

  @Prop({ type: Boolean, default: false })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
