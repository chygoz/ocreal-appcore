import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { MessageGateway } from './message.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from '../agent/schema/agent.schema';
import { User, UserSchema } from '../users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
      // { name: Property.name, schema: PropertySchema },
      // { name: PropertyDocumentRepo.name, schema: PropertyDocumentRepoSchema },
    ]),
  ],
  providers: [MessageGateway, SocketService],
})
export class SocketModule {}
