import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Conversation {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  })
  propertyId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  seller: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Agent.name,
    required: false,
  })
  sellerAgent: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: User.name,
  })
  buyer: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Agent.name,
  })
  buyerAgent: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
