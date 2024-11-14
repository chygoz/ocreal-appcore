import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageServiceGateway } from './message.gateway';
import { MessageService } from '../message/message.service';
import { ConversationService } from '../conversation/service/conversation.service';
import { Message, MessageSchema } from '../message/schema/message.schema';
import {
  Conversation,
  ConversationSchema,
} from '../conversation/schema/conversation.schema';
import { AwsS3Service } from '../uploader/aws';
import { OpenMessageServiceGateway } from './chat.gateway';
import { OpenConversationService } from '../conversation/service/openConversation.service';
import { OpenMessageService } from '../message/openmessage.service';
import {
  OpenConversation,
  OpenConversationSchema,
} from '../conversation/schema/openConversaion.schema';
import {
  OpenMessage,
  OpenMessageSchema,
} from '../message/schema/openmessage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: OpenConversation.name, schema: OpenConversationSchema },
      { name: OpenMessage.name, schema: OpenMessageSchema },
    ]),
  ],
  providers: [
    MessageServiceGateway,
    OpenMessageServiceGateway,
    MessageService,
    ConversationService,
    OpenConversationService,
    OpenMessageService,
    AwsS3Service,
  ],
})
export class SocketModule {}
