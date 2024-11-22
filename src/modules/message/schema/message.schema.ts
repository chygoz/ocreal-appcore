import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  })
  conversationId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true })
  senderId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String })
  text: string;

  @Prop({ type: String })
  sendTime: string;

  @Prop({ type: String })
  file: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
