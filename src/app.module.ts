import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { configs } from './configs';
import { User, UserSchema } from './modules/users/schema/user.schema';
import { AuthModule } from './modules/auth/auth.module';
import { AgentsModule } from './modules/agent/agents.module';
import { Agent, AgentSchema } from './modules/agent/schema/agent.schema';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { WebhooksModule } from './modules/webhooks/wehbooks.module';
import { PaymentModule } from './services/payments/payments.module';
import { StripeModule } from './services/stripe/stripe.module';
import { PropertyModule } from './modules/property/property.module';
import { MessageModule } from './modules/message/message.module';
import { InviteModule } from './modules/Agentinvite/agentInvite.module';
import { MessageGateway } from './modules/socket/message.gateway';
import { NotificationModule } from './modules/notification/notification.module';
import { PropertyService } from './modules/property/property.service';
import {
  Property,
  PropertySchema,
} from './modules/property/schema/property.schema';
import {
  PropertyTour,
  PropertyTourSchema,
} from './modules/property/schema/propertyTour.schema';
import {
  AgentPropertyInvite,
  AgentPropertyInviteSchema,
} from './modules/property/schema/agentPropertyInvite.schema';
import { Offer, OfferSchema } from './modules/property/schema/offer.schema';
import {
  PropertyQuery,
  PropertyQuerySchema,
} from './modules/property/schema/propertyQuery.schema';
import {
  UserSavedProperty,
  UserSavedPropertySchema,
} from './modules/property/schema/userFavoriteProperties.schema';
import { EmailModule } from './services/email/email.module';
import { S3Module } from './modules/s3/s3.module';
import {
  PropertyDocumentRepo,
  PropertyDocumentRepoSchema,
} from './modules/propertyRepo/schema/propertyDocumentRepo.schema';
import { PropertyRepoModule } from './modules/propertyRepo/propertyRepo.module';
import {
  OfferComment,
  OfferCommentSchema,
} from './modules/property/schema/offerComment.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobModule } from './cronJob/cronJob.module';
import {
  PropertyTourSchedule,
  PropertyTourScheduleSchema,
} from './modules/property/schema/proertyTourSchedule.schema';

@Module({
  imports: [
    MongooseModule.forRoot(configs.MONGO_DB_URL),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Property.name, schema: PropertySchema },
      { name: PropertyTour.name, schema: PropertyTourSchema },
      { name: AgentPropertyInvite.name, schema: AgentPropertyInviteSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: PropertyQuery.name, schema: PropertyQuerySchema },
      { name: UserSavedProperty.name, schema: UserSavedPropertySchema },
      { name: PropertyDocumentRepo.name, schema: PropertyDocumentRepoSchema },
      { name: OfferComment.name, schema: OfferCommentSchema },
      { name: PropertyTourSchedule.name, schema: PropertyTourScheduleSchema },
    ]),
    ScheduleModule.forRoot(),
    CronJobModule,
    UsersModule,
    AuthModule,
    AgentsModule,
    SubscriptionModule,
    WebhooksModule,
    StripeModule,
    PaymentModule,
    PropertyModule,
    MessageModule,
    InviteModule,
    NotificationModule,
    EmailModule,
    S3Module,
    PropertyRepoModule,
  ],
  controllers: [AppController],
  providers: [AppService, MessageGateway, PropertyService],
})
export class AppModule {}
