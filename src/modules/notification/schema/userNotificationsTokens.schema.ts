import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';

export type UserNotificationTokensDocument = UserNotificationTokens & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class UserNotificationTokens {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  agent: Agent;

  @Prop({
    type: SchemaTypes.String,
  })
  token: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserNotificationTokensSchema = SchemaFactory.createForClass(
  UserNotificationTokens,
);
