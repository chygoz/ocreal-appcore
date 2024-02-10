import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from './schema/plan.schema';
import { DuplicateException } from 'src/custom_errors';
import { StripeService } from 'src/services/stripe/stripe.service';
import { User } from '../users/schema/user.schema';
import { Subscription } from 'rxjs';
import Stripe from 'stripe';
import * as moment from 'moment';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Plan.name)
    private readonly planModel: Model<Plan>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<Subscription>,
    private readonly stripeService: StripeService,
  ) {}
  async createPlan(data: Partial<Plan>) {
    const planExists = await this.planModel.find({
      subscriptionType: data.subscriptionType,
    });
    if (planExists.length > 0) {
      throw new DuplicateException('This Plan already exists.');
    }
    const { price, product } = await this.stripeService.createStripePlan(
      data.subscriptionType,
    );

    return await this.planModel.create({
      ...data,
      stripePriceId: price.id,
      planCode: price.id,
      stripeProductId: product.id,
    });
  }

  async getUserSubscription(user: User) {
    const subscription = await this.subscriptionModel.findOne({
      user: user,
      active: true,
    });
    if (!subscription)
      throw new NotFoundException('You do not have an active subscription');
    return subscription;
  }

  async getSubscrioptionSession(user: User, id: string) {
    const plan = await this.planModel.findById(id);
    if (!plan) throw new NotFoundException('Plan not found');
    let stripe_customer_id = user.stripe_customer_id;
    if (!user.stripe_customer_id) {
      const customer = await this.stripeService.createCustomer(
        user.email,
        user.fullname || user.firstname + ' ' + user.lastname,
      );
      stripe_customer_id = customer.id;
      await this.userModel.findByIdAndUpdate(user.id, { stripe_customer_id });
    }

    const session = await this.stripeService.createSubscriptionStripeSession(
      stripe_customer_id,
      plan.stripePriceId,
    );
    return session;
  }

  async cancelSubscription(user: User) {
    const subscription = await this.subscriptionModel.findOne({
      user: user.id,
      active: true,
      expiryDate: { $gte: new Date() },
      canceled: { $ne: true },
    });
    if (!subscription)
      throw new NotFoundException('You do not have an active subcription');

    const result = await this.stripeService.cancelSubscription(
      user.stripe_customer_id,
    );
    await this.subscriptionModel.findByIdAndUpdate(subscription.id, {
      canceled: true,
    });
    return result;
  }

  async handleSubscriptionUpdates(
    subscriptionScheduleCreated: Stripe.Subscription,
    user: User,
    plan: PlanDocument,
  ) {
    await this.subscriptionModel.updateMany(
      {
        user: user.id,
        active: true,
      },
      {
        active: false,
      },
    );
    return await this.subscriptionModel.findOneAndUpdate(
      { user: user.id },
      {
        plan: plan.id,
        subscriptionCode: subscriptionScheduleCreated.id,
        active: true,
        expiryDate: moment().add(1, 'month').toDate(),
      },
    );
  }

  async createNewSubscription(
    planId: string,
    stripe_customer_id: string,
    stripeSubId: string,
  ) {
    const user = await this.userModel.findOne({ stripe_customer_id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const planExists = await this.planModel.findById(planId);

    if (!planExists) {
      throw new NotFoundException('Plan not found');
    }

    await this.subscriptionModel.updateMany(
      {
        user: user.id,
      },
      {
        active: false,
      },
    );

    const dataToSave = {
      stripe_subscription_id: stripeSubId,
      subcriptionType: planExists.subscriptionType,
      user: user,
      plan: planExists,
      expiryDate: moment().add(1, 'month').toDate(),
      active: true,
    };

    const newSubs = await this.subscriptionModel.create(dataToSave);
    return newSubs;
  }
}
