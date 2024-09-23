import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { configs } from 'src/configs';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/users/schema/user.schema';
import {
  Payment,
  PaymentSchema,
} from '../../modules/payments/schema/payment.schema';
// import { ConfigurableModuleClass } from './instance.stripe';

// @Module({
//   providers: [StripeService],
//   exports: [StripeService],
//   imports: [],
// })
// export class StripeModule extends ConfigurableModuleClass {}

@Module({
  providers: [
    {
      provide: 'Stripe',
      useFactory: () =>
        new Stripe(configs.STRIPE_SECRET_KEY, {
          apiVersion: '2023-10-16',
        }),
    },
    StripeService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  exports: ['Stripe', StripeService],
})
export class StripeModule {}
