import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageSchema, Message } from './schema/message.schema';
import { ChatSchema, Chat } from './schema/chat.shcema';
import { MessageController } from './message.controller';
import { UserSchema, User } from '../users/schema/user.schema';
import { AgentSchema, Agent } from '../agent/schema/agent.schema';
import { MessageGateway } from './schema/messageGateway.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  exports: [MessageService],
  providers: [MessageService, MessageGateway],
  controllers: [MessageController],
})
export class MessageModule {}
