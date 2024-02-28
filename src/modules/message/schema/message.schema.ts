// Message.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { Property } from 'src/modules/property/schema/property.schema';
import { User } from 'src/modules/users/schema/user.schema';
import { Chat } from './chat.shcema';

export type MessageDocument = HydratedDocument<Message>;
export enum MessageTypeEnum {
  userToAgent = 'UserToAgent',
  agentToAgent = 'AgentToAgent',
}

@Schema({
  timestamps: true,
  toJSON: {
    getters: true,
  },
})
export class Message extends Document {
  @Prop([{ type: SchemaTypes.ObjectId, ref: Chat.name }])
  chats: Chat[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user?: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  agent?: Agent;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  buyerAgent?: Agent;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  sellerAgent?: Agent;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property' })
  property: Property;

  @Prop({ type: String, enum: Object.values(MessageTypeEnum) })
  messageType: MessageTypeEnum;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
