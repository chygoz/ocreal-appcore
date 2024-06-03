import { Module } from '@nestjs/common';
import { S3Controller } from './s3.controller';
import { S3Service } from './s3.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from '../agent/schema/agent.schema';
import { Property, PropertySchema } from '../property/schema/property.schema';
import { User, UserSchema } from '../users/schema/user.schema';

@Module({
  exports: [S3Service],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Property.name, schema: PropertySchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  providers: [S3Service],
  controllers: [S3Controller],
})
export class S3Module {}
