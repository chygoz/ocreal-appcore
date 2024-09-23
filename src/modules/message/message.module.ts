import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageSchema, Message } from './schema/message.schema';
import { ChatSchema, Chat } from './schema/chat.schema';
import { MessageController } from './message.controller';
import { UserSchema, User } from '../users/schema/user.schema';
import { AgentSchema, Agent } from '../agent/schema/agent.schema';
import { SocketModule } from '../socket/socket.module';
import { MessageGateway } from '../socket/message.gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
    SocketModule,
    NotificationModule,
  ],
  exports: [MessageService],
  providers: [MessageService, MessageGateway],
  controllers: [MessageController],
})
export class MessageModule {}
