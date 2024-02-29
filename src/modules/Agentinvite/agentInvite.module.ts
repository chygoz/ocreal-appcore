import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/services/email/email.module';
import { AgentInvite, AgentInviteSchema } from './schema/agentInvite.schema';
import { InviteService } from './agentInvite.service';
import { Agent, AgentSchema } from '../agent/schema/agent.schema';
import { InviteController } from './agentInvite.controller';
import { UserSchema, User } from '../users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: AgentSchema },
      { name: User.name, schema: UserSchema },
      { name: AgentInvite.name, schema: AgentInviteSchema },
    ]),
    EmailModule,
  ],
  controllers: [InviteController],
  providers: [InviteService],
})
export class InviteModule {}
