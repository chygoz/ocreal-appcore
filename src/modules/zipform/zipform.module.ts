import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ZipFormService } from './service/zipform.service';
import { ZipFormController } from './controller/zipform.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema } from './schema/transaction.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { Agent } from 'http';
import { AgentSchema } from '../agent/schema/agent.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'Transaction', schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  providers: [ZipFormService],
  controllers: [ZipFormController],
})
export class ZipFormModule {}
