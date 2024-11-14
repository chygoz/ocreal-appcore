import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type OpenMessageDocument = OpenMessage & Document;

@Schema({ timestamps: true })
export class OpenMessage {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  })
  conversationId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  senderId: Types.ObjectId;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, required: false })
  attachmentUrl: string;
}

export const OpenMessageSchema = SchemaFactory.createForClass(OpenMessage);
