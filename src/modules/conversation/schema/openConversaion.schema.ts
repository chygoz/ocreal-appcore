import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type OpenConversationDocument = OpenConversation & Document;

@Schema({ timestamps: true })
export class OpenConversation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  propertyId: Types.ObjectId; // The property related to the conversation

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'membersType' }],
    required: false,
  })
  members: Types.ObjectId[]; // Array of user and agent IDs in the conversation

  @Prop({
    type: [{ type: String, enum: ['Agent', 'User'] }],
    required: true,
  })
  membersType: string[]; // Specifies the type (either Agent or User) for each member
}

export const OpenConversationSchema =
  SchemaFactory.createForClass(OpenConversation);
