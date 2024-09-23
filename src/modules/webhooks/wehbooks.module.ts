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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    EmailModule,
    StripeModule,
    SubscriptionModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
