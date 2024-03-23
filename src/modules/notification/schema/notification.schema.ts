import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';

export enum NotificationUserType {
  agent = 'Agent',
  user = 'User',
}
@Schema({ timestamps: true, versionKey: false })
export class Notification extends Document {
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

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
