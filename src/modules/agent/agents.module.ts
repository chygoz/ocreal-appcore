import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/services/email/email.module';
import { AgentSchema, Agent } from './schema/agent.schema';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { User, UserSchema } from '../users/schema/user.schema';
import { Property, PropertySchema } from '../property/schema/property.schema';
import { AgentOrSellerSocketAuthGuard } from 'src/guards/jw.socket.gaurd';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: AgentSchema },
      { name: User.name, schema: UserSchema },
      { name: Property.name, schema: PropertySchema },
    ]),
    EmailModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService, AgentOrSellerSocketAuthGuard],
})
export class AgentsModule {}
