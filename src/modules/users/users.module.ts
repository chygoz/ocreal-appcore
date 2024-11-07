import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { UsersService } from './users.service';
import { EmailModule } from 'src/services/email/email.module';
import { UserDocumentSchema, UserDocument } from './schema/user_documents';
import { EmailService } from 'src/services/email/email.service';
import { AgentOrSellerSocketAuthGuard } from 'src/guards/jw.socket.gaurd';
import { Agent } from 'http';
import { AgentSchema } from '../agent/schema/agent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserDocument.name, schema: UserDocumentSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, EmailService, AgentOrSellerSocketAuthGuard],
})
export class UsersModule {}
