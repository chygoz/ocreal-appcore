import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Conversation {
  @Prop({
    type: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: true,
      },
    },
    required: true,
  })
  members: {
    userId: string;
    agentId: string;
  };
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
