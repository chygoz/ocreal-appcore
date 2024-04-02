import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { Document } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';

export type ChatDocument = Chat & Document;
export enum UserTypeEnum {
  user = 'User',
  agent = 'Agent',
}

@Schema({
  timestamps: true,
  toJSON: {
    getters: true,
  },
})
export class Chat {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Message' })
  message: string;

  @Prop([{ type: SchemaTypes.String }])
  documents: Array<string>;

  @Prop()
  content: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    refPath: 'senderType',
  })
  sender: Agent | User;

  @Prop({ type: SchemaTypes.String, enum: UserTypeEnum })
  senderType: UserTypeEnum;
}
export const ChatSchema = SchemaFactory.createForClass(Chat);
