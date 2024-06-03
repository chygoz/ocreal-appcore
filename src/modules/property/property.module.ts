import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyService } from './property.service';
import { EmailModule } from 'src/services/email/email.module';
import {
  PropertyQuery,
  PropertyQuerySchema,
} from './schema/propertyQuery.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { Property, PropertySchema } from './schema/property.schema';
import { Agent, AgentSchema } from '../agent/schema/agent.schema';
import { PropertyTourSchema, PropertyTour } from './schema/propertyTour.schema';
import { Offer, OfferSchema } from './schema/offer.schema';
import {
  AgentPropertyInvite,
  AgentPropertyInviteSchema,
} from './schema/agentPropertyInvite.schema';
import {
  UserSavedProperty,
  UserSavedPropertySchema,
} from './schema/userFavoriteProperties.schema';
import { NotificationModule } from '../notification/notification.module';
import {
  PropertyDocumentRepo,
  PropertyDocumentRepoSchema,
} from '../propertyRepo/schema/propertyDocumentRepo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Property.name, schema: PropertySchema },
      { name: PropertyQuery.name, schema: PropertyQuerySchema },
      { name: Agent.name, schema: AgentSchema },
      { name: PropertyTour.name, schema: PropertyTourSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: AgentPropertyInvite.name, schema: AgentPropertyInviteSchema },
      { name: UserSavedProperty.name, schema: UserSavedPropertySchema },
      { name: PropertyDocumentRepo.name, schema: PropertyDocumentRepoSchema },
    ]),
    EmailModule,
    NotificationModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
