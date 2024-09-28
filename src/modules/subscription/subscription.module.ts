import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionController } from './subscription.controller.';
import { SubscriptionService } from './subscription.service';
import { Plan, PlanSchema } from './schema/plan.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { SubscriptionSchema, Subscription } from './schema/subscription.schema';
import { StripeModule } from 'src/services/stripe/stripe.module';
import { AgentSchema, Agent } from '../agent/schema/agent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
    StripeModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
