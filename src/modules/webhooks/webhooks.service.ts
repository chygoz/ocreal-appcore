import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/services/email/email.service';
import Stripe from 'stripe';
import { User } from '../users/schema/user.schema';
import { StripeService } from 'src/services/stripe/stripe.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { Plan } from '../subscription/schema/plan.schema';
import {
  Payment,
  PaymentTypeEnum,
} from 'src/modules/payments/schema/payment.schema';
import { generateReferralCode } from 'src/utils/randome-generators';
import { PaymentService } from '../payments/payment.service';
import { Agent } from '../agent/schema/agent.schema';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Agent.name) private readonly asgentModel: Model<Agent>,
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    private readonly emailService: EmailService,
    private readonly stripeService: StripeService,
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentService: PaymentService,
  ) {}

  async handleStripeEvent(sig: string, eventId: string) {
    let event;
    try {
      // event = this.stripeService.constructEvent(sig, unsignedEvent);
      event = await this.stripeService.retrieveEventObject(eventId);
    } catch (e) {
      throw new BadRequestException(`Webhook Error: ${e.message}`);
    }
    // Handle specific event types
    switch (event.type) {
      case 'invoice.paid':
        const invoiceCompletedObject = event.data.object as Stripe.Invoice;
        const invoiceLineLastData = invoiceCompletedObject.lines.data.pop();
        const subscriptionId = invoiceLineLastData?.subscription as string;
        const invoiceSubscription =
          await this.stripeService.retriveStripeSubscription(subscriptionId);
        if (!invoiceSubscription) {
          return false;
        }
        if (invoiceSubscription.status == 'active') {
          console.log('::: SUBSCRIPTION PAYMENT CONFIRMED :::');
          await this.handleActiveSubscription(invoiceSubscription);
        }
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment intent failed:', event.data.object);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }
  }

  async handleActiveSubscription(
    subscriptionScheduleCreated: Stripe.Subscription,
  ) {
    const invoiceObject = await this.stripeService.getInvoiceObject(
      subscriptionScheduleCreated.latest_invoice as string,
    );
    const stripe_customer_id = invoiceObject.customer as string;
    const amountInCents = invoiceObject.amount_paid;
    const amount = amountInCents / 100;
    const invoiceUrl = invoiceObject.hosted_invoice_url!;
    const stripeSubItem = subscriptionScheduleCreated.items.data.pop();
    const plan = await this.planModel.findOne({
      stripePriceId: stripeSubItem!.price.id,
    });
    const user = await this.userModel.findOne({
      stripe_customer_id,
    });
    if (user) {
      switch (invoiceObject.billing_reason) {
        case 'subscription_update':
          console.log('::: SUBSCRIPTION UPDATE EVENT CALLED :::');
          if (invoiceObject.paid) {
            await this.subscriptionService.handleSubscriptionUpdates(
              subscriptionScheduleCreated,
              user,
              plan,
            );
          }
          break;
        case 'subscription_create':
          console.log('::: CRREATING A BRAND NEW SUBSCRIPTION :::');
          const { customer } = subscriptionScheduleCreated;
          await this.stripeService.cancelOldStripeSubs(
            customer as string,
            subscriptionScheduleCreated.id,
          );
          await this.subscriptionService.createNewSubscription(
            plan.id,
            customer as string,
            subscriptionScheduleCreated.id,
          );
          break;
        case 'subscription_cycle':
          console.log('::: SUBSCRIPTION RENEWAL EVENT CALLED :::');
          if (invoiceObject.paid) {
            await this.subscriptionService.handleSubscriptionUpdates(
              subscriptionScheduleCreated,
              user,
              plan,
            );
          }
          break;
      }
      const paymentUpdateData = {
        paymentType: PaymentTypeEnum.subscription,
        amount: {
          amount: amount,
          currency: invoiceObject.currency.toUpperCase(),
        },
        user: user?._id,
        reference: `REF-${generateReferralCode(6)}`,
        receiptUrl: invoiceUrl,
        stripeInvoiceId: invoiceObject.id,
      };
      await this.paymentModel.create(paymentUpdateData);
    } else {
      const agent = await this.asgentModel.findOne({
        stripe_customer_id,
      });
      switch (invoiceObject.billing_reason) {
        case 'subscription_update':
          console.log('::: SUBSCRIPTION UPDATE EVENT CALLED :::');
          if (invoiceObject.paid) {
            await this.subscriptionService.handleAgentSubscriptionUpdates(
              subscriptionScheduleCreated,
              agent,
              plan,
            );
          }
          break;
        case 'subscription_create':
          console.log('::: CRREATING A BRAND NEW SUBSCRIPTION :::');
          const { customer } = subscriptionScheduleCreated;
          await this.stripeService.cancelOldStripeSubs(
            customer as string,
            subscriptionScheduleCreated.id,
          );
          await this.subscriptionService.createAgentNewSubscription(
            plan.id,
            customer as string,
            subscriptionScheduleCreated.id,
          );
          break;
        case 'subscription_cycle':
          console.log('::: SUBSCRIPTION RENEWAL EVENT CALLED :::');
          if (invoiceObject.paid) {
            await this.subscriptionService.handleAgentSubscriptionUpdates(
              subscriptionScheduleCreated,
              agent,
              plan,
            );
          }
          break;
      }
      const paymentUpdateData = {
        paymentType: PaymentTypeEnum.subscription,
        amount: {
          amount: amount,
          currency: invoiceObject.currency.toUpperCase(),
        },
        agent: agent?._id,
        reference: `REF-${generateReferralCode(6)}`,
        receiptUrl: invoiceUrl,
        stripeInvoiceId: invoiceObject.id,
      };
      await this.paymentModel.create(paymentUpdateData);
    }
  }
}
