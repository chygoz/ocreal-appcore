import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/services/email/email.module';
import { AgentSchema, Agent } from './schema/agent.schema';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { User, UserSchema } from '../users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: AgentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
})
export class AgentsModule {}
