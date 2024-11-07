import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';

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

  @Prop({ type: MongooseSchema.Types.ObjectId, refPath: 'userType' })
  user: User | Agent;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: Object.values(NotificationUserType),
    default: NotificationUserType.user,
  })
  userType: NotificationUserType;

  @Prop({ type: Boolean, default: false })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
