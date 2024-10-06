import { Module } from '@nestjs/common';
import NotificationService from './notitifcation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './notification.controller';
import { User, UserSchema } from 'src/modules/users/schema/user.schema';
import { EmailModule } from 'src/services/email/email.module';
import { NotificationSchema, Notification } from './schema/notification.schema';
import { AgentSchema, Agent } from '../agent/schema/agent.schema';
import {
  UserNotificationTokens,
  UserNotificationTokensSchema,
} from './schema/userNotificationsTokens.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Agent.name, schema: AgentSchema },
      {
        name: UserNotificationTokens.name,
        schema: UserNotificationTokensSchema,
      },
    ]),
    EmailModule,
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
