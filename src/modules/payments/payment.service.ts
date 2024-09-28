import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/modules/users/schema/user.schema';
import { Payment } from './schema/payment.schema';
import { Invoice } from './schema/invoice.schema';
// import { EmailService } from '../email/email.service';

import Stripe from 'stripe';
import { configs } from 'src/configs';
import { actionsAndPrices, ActionsEnum } from './payments/payments_and_prices';
import { PaginationDto } from 'src/constants/pagination.dto';
import { Agent } from '../agent/schema/agent.schema';

const stripe = new Stripe(configs.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export enum PaymentUserTypeEnum {
  buyer = 'buyer',
  seller = 'seller',
  agent = 'agent',
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Payment.name) private readonly PaymentModel: Model<Payment>,
    @InjectModel(Invoice.name) private readonly InvoiceModel: Model<Invoice>,
    // private readonly emailService: EmailService,
  ) {}

  async getAllUserPayments(user: User, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const skip = (page - 1) * limit;
    const query = {
      user: user._id,
    };
    const [result, total] = await Promise.all([
      this.PaymentModel.find({ query }).skip(skip).limit(limit).exec(),
      this.PaymentModel.countDocuments({ query }),
    ]);
    return { result, total, page, limit };
  }

  async getAllAgentPayments(agent: Agent, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const skip = (page - 1) * limit;
    const query = {
      agent: agent._id,
    };
    const [result, total] = await Promise.all([
      this.PaymentModel.find({ query }).skip(skip).limit(limit).exec(),
      this.PaymentModel.countDocuments({ query }),
    ]);
    return { result, total, page, limit };
  }

  async _createStripeCheckOut(paymentDate: {
    actionEnum: ActionsEnum;
    metadata: any;
    userType: PaymentUserTypeEnum;
  }) {
    const { actionEnum, metadata, userType } = paymentDate;

    const price = this._getActionPrice(userType, actionEnum);
    if (!price || typeof price !== 'number') {
      throw new BadRequestException(
        'Something went wrong while performing this action, please try again later',
      );
    }
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sample Product',
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        description: this._getPaymentDescription(actionEnum),
        metadata,
      },
      mode: 'payment',
      success_url: `${configs.BASE_URL}/payment-success`,
      cancel_url: `${configs.BASE_URL}/payment`,
      metadata,
    });

    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: 'usd',
    //         product_data: {
    //           name: 'Sample Product',
    //         },
    //         unit_amount: 2000, // Amount in cents
    //       },
    //       quantity: 1,
    //     },
    //   ],
    //   mode: 'payment',
    //   success_url: `${configs.BASE_URL}/payment-success`,
    //   cancel_url: `${configs.BASE_URL}/payment`,
    // });

    return {
      sessionId: session.id,
    };
  }

  private _getPaymentDescription(action: ActionsEnum): string {
    switch (action) {
      case ActionsEnum.SEND_OFFER:
        return 'Payment for sending an offer';
      case ActionsEnum.CLOSING_SERVICES:
        return 'Payment for closing services';
      case ActionsEnum.AI_ASSISTED_DISCLOSURE_SUMMARY:
        return 'Payment for AI-assisted disclosure summary';
      case ActionsEnum.AGENT_ASSISTED_SHOWINGS:
        return 'Payment for agent-assisted showings';
      case ActionsEnum.REVIEW_CMA_DISCLOSURES:
        return 'Payment for reviewing CMA and disclosures';
      case ActionsEnum.REVIEW_DETAILED_ANALYTICS_CMA:
        return 'Payment for reviewing detailed analytics and CMA';
      case ActionsEnum.CALENDAR_SERVICES_APPROVAL:
        return 'Payment for calendar services approval';
      case ActionsEnum.SEND_COUNTER_OFFER:
        return 'Payment for sending a counter offer';
      case ActionsEnum.GENERATE_CMA:
        return 'Payment for generating a CMA report';
      case ActionsEnum.YEARLYSUBSCRIPTION:
        return 'Payment for yearly subscription';
      case ActionsEnum.MONTHLYSUBSCRIPTION:
        return 'Payment for monthly subscription';
      default:
        return 'Unknown action';
    }
  }

  private _getActionPrice(userRole: PaymentUserTypeEnum, action: ActionsEnum) {
    switch (action) {
      case ActionsEnum.SEND_OFFER:
        return userRole !== PaymentUserTypeEnum.agent
          ? false
          : actionsAndPrices[userRole].sendOffer.price;
      case ActionsEnum.CLOSING_SERVICES:
        return actionsAndPrices[userRole].closingServices.price;

      case ActionsEnum.AI_ASSISTED_DISCLOSURE_SUMMARY:
        return actionsAndPrices[userRole].aiAssistedDisclosureSummary.price;

      case ActionsEnum.AGENT_ASSISTED_SHOWINGS:
        return actionsAndPrices[userRole].agentAssistedShowings.disabled
          ? 'Service disabled'
          : actionsAndPrices[userRole].agentAssistedShowings.price;

      case ActionsEnum.REVIEW_CMA_DISCLOSURES:
        return actionsAndPrices[userRole].reviewCMAAndDisclosures.disabled
          ? 'Service disabled'
          : actionsAndPrices[userRole].reviewCMAAndDisclosures.price;

      case ActionsEnum.REVIEW_DETAILED_ANALYTICS_CMA:
        return actionsAndPrices[userRole].reviewDetailedAnalyticsAndCMA.disabled
          ? 'Service disabled'
          : actionsAndPrices[userRole].reviewDetailedAnalyticsAndCMA.price;

      case ActionsEnum.CALENDAR_SERVICES_APPROVAL:
        return userRole !== PaymentUserTypeEnum.agent
          ? false
          : actionsAndPrices[userRole].calendarServicesApproval?.price ||
              'Not applicable';

      case ActionsEnum.SEND_COUNTER_OFFER:
        return userRole !== PaymentUserTypeEnum.agent
          ? false
          : actionsAndPrices[userRole].sendCounterOffer.price;

      case ActionsEnum.GENERATE_CMA:
        return userRole === PaymentUserTypeEnum.seller
          ? actionsAndPrices[userRole].generateCMA!.price
          : false;

      case ActionsEnum.YEARLYSUBSCRIPTION:
        return userRole !== PaymentUserTypeEnum.agent
          ? false
          : actionsAndPrices[userRole].yearlySubscription?.price ||
              'Not applicable';

      case ActionsEnum.MONTHLYSUBSCRIPTION:
        return userRole !== PaymentUserTypeEnum.agent
          ? false
          : actionsAndPrices[userRole].monthlySubscription?.price ||
              'Not applicable';

      default:
        return 'Action not found';
    }
  }
}
