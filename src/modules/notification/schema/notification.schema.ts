import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';

export enum NotificationRuleEnum {
  User = 'User',
  Agent = 'Agent',
}

@Schema({ timestamps: true, versionKey: false })
export class Notification extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, refPath: 'refPath' })
  user: User | Agent;

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop({
    type: MongooseSchema.Types.String,
    default: NotificationRuleEnum.User,
  })
  refPath: NotificationRuleEnum;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
