import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { configs } from 'src/configs';
import { PlanTypeEnum } from 'src/modules/subscription/schema/plan.schema';
// import { Payment } from '../payments/schema/payment.shcema';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User } from 'src/modules/users/schema/user.schema';
// import { Plan } from 'src/modules/subscription/schema/plan.schema';

@Injectable()
export class StripeService {
  constructor(@Inject('Stripe') private readonly stripe: Stripe) {}

  async retrieveEventObject(eventId: string) {
    const event = await this.stripe.events.retrieve(eventId);
    if (!event) throw new Error('Event not found');
    return event;
  }

  async createCustomer(email: string, name: string) {
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  async constructEvent(sig: string, payload: string | Buffer) {
    return this.stripe.webhooks.constructEvent(
      payload,
      sig,
      configs.STRIPE_WEBHOOK_SECRET,
    );
  }

  async createStripePlan(subscriptionType: PlanTypeEnum) {
    const product = await this.stripe.products.create({
      name: subscriptionType,
    });

    const cost = {
      amount: 100,
      currency: 'usd',
    };

    const price = await this.stripe.prices.create({
      product: product.id,
      unit_amount: cost.amount * 100,
      currency: cost.currency,
      recurring: {
        interval: 'month',
      },
    });
    return { price, product };
  }

  async createSubscriptionStripeSession(
    stripeCustomerId: string,
    stripePriceId: string,
  ) {
    const session = await this.stripe.checkout.sessions.create({
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: 'subscription',
      // payment_method_types: ['card'],
      success_url: `${configs.BASE_URL}/dashboard/payment/success`,
      cancel_url: `${configs.BASE_URL}/dashboard/payment/error`,
      customer: stripeCustomerId,
      metadata: {
        planId: stripePriceId,
        stripeCustomerId,
        subscription_purchase: 'true',
      },
    });
    return {
      checkoutUrl: session.url,
    };
  }

  async cancelSubscription(stripeCustomerId: string) {
    const stripeSubscription = await this.stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
    });
    const subs = stripeSubscription.data;
    if (subs.length > 0) {
      for (const sub of subs) {
        await this.stripe.subscriptions.cancel(sub.id);
      }
    }
    return true;
  }

  async retriveStripeSubscription(subscriptionId: string) {
    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async getInvoiceObject(latest_invoice: string) {
    const invoiceObject = await this.stripe.invoices.retrieve(latest_invoice);
    return invoiceObject;
  }

  async retrivePriceIdfromCheckout(subscriptionId: string, invoiceId: string) {
    const checkoutList = await this.stripe.checkout.sessions.list({
      subscription: subscriptionId,
    });
    const checkoutObject = checkoutList.data.find(
      (checkout) => checkout.invoice == invoiceId,
    );
    return checkoutObject?.metadata?.stripePriceId;
  }

  async cancelOldStripeSubs(customer: string, subscriptionId: string) {
    const stripeSubscription = await this.stripe.subscriptions.list({
      customer: customer,
      status: 'active',
    });
    const subs = stripeSubscription.data.filter(
      (data) => data.id != subscriptionId,
    );
    if (subs.length > 0) {
      for (const sub of subs) {
        await this.stripe.subscriptions.cancel(sub.id);
      }
    }
  }

  // async handleSubscriptionCreation(
  //   subscriptionScheduleCreated: Stripe.Subscription,
  //   stripePriceId: string,
  // ) {
  //   console.log('::: Subscription Creation Event :::');
  //   const { customer } = subscriptionScheduleCreated;

  //   const stripeSubscription = await this.stripe.subscriptions.list({
  //     customer: customer as string,
  //     status: 'active',
  //   });
  //   const subs = stripeSubscription.data.filter(
  //     (data) => data.id != subscriptionScheduleCreated.id,
  //   );
  //   if (subs.length > 0) {
  //     for (const sub of subs) {
  //       await this.stripe.subscriptions.cancel(sub.id);
  //     }
  //   }

  //   return await this.subscriptionService.createNewSubscription(
  //     stripePriceId,
  //     customer as string,
  //     subscriptionScheduleCreated.id,
  //   );
  // }
}
