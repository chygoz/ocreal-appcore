import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/services/email/email.module';
import { StripeModule } from 'src/services/stripe/stripe.module';
import { User, UserSchema } from '../users/schema/user.schema';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { Plan, PlanSchema } from '../subscription/schema/plan.schema';
import {
  Payment,
  PaymentSchema,
} from 'src/modules/payments/schema/payment.schema';
import { AgentSchema, Agent } from '../agent/schema/agent.schema';
import { PaymentModule } from '../payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
    EmailModule,
    StripeModule,
    SubscriptionModule,
    PaymentModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
