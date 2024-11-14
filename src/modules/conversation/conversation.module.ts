import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schema/conversation.schema';
import { ConversationService } from './service/conversation.service';
import { OpenConversationService } from './service/openConversation.service';
import {
  OpenConversation,
  OpenConversationSchema,
} from './schema/openConversaion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: OpenConversation.name, schema: OpenConversationSchema },
    ]),
  ],
  exports: [ConversationService, OpenConversationService],
  providers: [ConversationService, OpenConversationService],
  controllers: [],
})
export class ConversationServiceModule {}
