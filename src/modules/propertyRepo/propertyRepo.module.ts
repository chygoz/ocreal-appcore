import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from '../notification/notification.module';
import { PropertyRepoController } from '../propertyRepo/propertyRepo.controller';
import {
  PropertyDocumentRepo,
  PropertyDocumentRepoSchema,
} from '../propertyRepo/schema/propertyDocumentRepo.schema';
import { PropertyRepoService } from './propertyRepo.service';
import { EmailModule } from 'src/services/email/email.module';
import { Property, PropertySchema } from '../property/schema/property.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { Agent, AgentSchema } from '../agent/schema/agent.schema';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Property.name, schema: PropertySchema },
      { name: PropertyDocumentRepo.name, schema: PropertyDocumentRepoSchema },
    ]),
    EmailModule,
    NotificationModule,
    S3Module,
  ],
  controllers: [PropertyRepoController],
  providers: [PropertyRepoService],
})
export class PropertyRepoModule {}
