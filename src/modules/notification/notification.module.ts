import { Module } from '@nestjs/common';
import NotificationService from './notitifcation.service';
import { EmailModule } from '../../services/email/email.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema, Notification } from './schema/notification.schema';
import { NotificationController } from './notification.controller';
import { User, UserSchema } from '../users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailModule,
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
