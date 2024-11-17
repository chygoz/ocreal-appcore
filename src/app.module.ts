import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { configs } from './configs';
import { AuthModule } from './modules/auth/auth.module';
import { AgentsModule } from './modules/agent/agents.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { WebhooksModule } from './modules/webhooks/wehbooks.module';
import { PaymentModule } from './modules/payments/payments.module';
import { StripeModule } from './services/stripe/stripe.module';
import { PropertyModule } from './modules/property/property.module';
import { MessageModule } from './modules/message/message.module';
import { InviteModule } from './modules/Agentinvite/agentInvite.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './services/email/email.module';
import { S3Module } from './modules/s3/s3.module';
import { PropertyRepoModule } from './modules/propertyRepo/propertyRepo.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobModule } from './cronJob/cronJob.module';
import { FirebaseMessagingModule } from './modules/firebase/firebase-messaging.module';
import { User, UserSchema } from './modules/users/schema/user.schema';
import { Agent } from 'http';
import { AgentSchema } from './modules/agent/schema/agent.schema';
import { ZipFormModule } from './modules/zipform/zipform.module';
import { HttpModule } from '@nestjs/axios';
import { ConversationServiceModule } from './modules/conversation/conversation.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forRoot(configs.MONGO_DB_URL),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '100d' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
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
    FirebaseMessagingModule,
    ZipFormModule,
    HttpModule,
    ConversationServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
