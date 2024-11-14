import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageSchema, Message } from './schema/message.schema';
import { SocketModule } from '../socket/socket.module';
import { NotificationModule } from '../notification/notification.module';
import {
  Conversation,
  ConversationSchema,
} from '../conversation/schema/conversation.schema';
import { AwsS3Service } from '../uploader/aws';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    SocketModule,
    NotificationModule,
  ],
  exports: [MessageService],
  providers: [MessageService, AwsS3Service],
  controllers: [],
})
export class MessageModule {}
