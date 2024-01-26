import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/services/email/email.module';
import { User, UserSchema } from '../users/schema/user.schema';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AgentsModule } from '../agent/agents.module';
import { UsersModule } from '../users/users.module';
import { AgentSchema, Agent } from '../agent/schema/agent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
    EmailModule,
    AgentsModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
