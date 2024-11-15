import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Conversation {
  @Prop({
    type: {
      propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
      sellerAgentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: false,
      },
      buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
      buyerAgentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: false,
      },
    },
    required: true,
  })
  members: {
    propertyId: string;
    sellerId?: string;
    sellerAgentId?: string;
    buyerId?: string;
    buyerAgentId?: string;
  };
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
