import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../users/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { EmailService } from 'src/services/email/email.service';
import { Property, PropertyStatusEnum } from './schema/property.schema';
import { PropertyQuery } from './schema/propertyQuery.schema';
import {
  AddAgentToPropertyDto,
  AgentAcceptInviteDto,
  AgentCreatePropertyDto,
  CreatePropertyDTO,
  CreatePropertyDto,
  PropertyOfferComment,
  SavePropertyQueryDTO,
  SellerOrAgentPublishPropertyDto,
  UpdatePropertyDto,
} from './dto/property.dto';
import { AccountTypeEnum } from 'src/constants';
import { Agent } from '../agent/schema/agent.schema';
import { PaginationDto } from 'src/constants/pagination.dto';
import { PropertyTour } from './schema/propertyTour.schema';
import {
  CreateTourDto,
  PropertyTourScheduleDto,
  UpdatePropertyTourScheduleDto,
} from './dto/tour.dto';
import {
  AddPropertyCoBuyerDto,
  CreateAgentPropertyOfferDto,
  CreateCounterOfferDto,
  CreateUserOfferDto,
  OfferResponseDto,
  SellerOrSellerAgentAcceptOffer,
} from './dto/offer.dto';
import { configs } from 'src/configs';
import axios, { AxiosInstance } from 'axios';
import {
  Offer,
  OfferCreatorTypeEnum,
  OfferStatusEnum,
  OfferTypeEnum,
} from './schema/offer.schema';
import {
  AgentPropertyInvite,
  AgentPropertyInviteStatusEnum,
} from './schema/agentPropertyInvite.schema';
import { UserSavedProperty } from './schema/userFavoriteProperties.schema';
import NotificationService from '../notification/notitifcation.service';
import { NotificationUserType } from '../notification/schema/notification.schema';
import * as moment from 'moment';
import { PropertyDocumentRepo } from '../propertyRepo/schema/propertyDocumentRepo.schema';
import { CreatePropertyDocumentDto } from './dto/AddProperty.dto';
import { OfferComment } from './schema/offerComment.schema';
import { PropertyTourSchedule } from './schema/proertyTourSchedule.schema';
import { SharePropertyDoc } from './schema/shareDocument.schema';
import { CreateSharePropertyDocDto } from './dto/shareDocument.dto';
import { generateReferralCode } from 'src/utils/randome-generators';

@Injectable()
export class PropertyService {
  private readonly axiosInstance: AxiosInstance;
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel(PropertyDocumentRepo.name)
    private propertyDocumentRepo: Model<PropertyDocumentRepo>,
    @InjectModel(Agent.name) private agentModel: Model<Agent>,
    @InjectModel(PropertyTour.name)
    private propertyTourModel: Model<PropertyTour>,
    @InjectModel(AgentPropertyInvite.name)
    private agentPropertyInviteModel: Model<AgentPropertyInvite>,
    @InjectModel(Offer.name)
    private offerModel: Model<Offer>,
    @InjectModel(PropertyQuery.name)
    private propertyQueryModel: Model<PropertyQuery>,
    @InjectModel(UserSavedProperty.name)
    private userSavedPropertyModel: Model<UserSavedProperty>,
    @InjectModel(PropertyTourSchedule.name)
    private propertyTourScheduleModel: Model<PropertyTourSchedule>,
    @InjectModel(OfferComment.name)
    private offerCommentModel: Model<OfferComment>,
    @InjectModel(SharePropertyDoc.name)
    private sharePropertyDocModel: Model<SharePropertyDoc>,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    // private readonly axiosInstance: AxiosInstance,
  ) {
    this.axiosInstance = axios.create({
      // baseURL: 'https://api.datafiniti.co/v4/',
      // timeout: 5000,
      // headers: {
      //   Authorization: 'Bearer ' + configs.DATA_INFINITI_API_KEY,
      //   'Content-Type': 'application/json',
      //   'x-api-key': configs.MLS_API_AUTH_KEY,
      //   'X-RapidAPI-Key': configs.MLS_RAPID_API_KEY,
      //   'X-RapidAPI-Host': 'mls-router1.p.rapidapi.com',
      // },
    });
  }

  async sharePropertyDocument(
    user: User | Agent,
    dto: CreateSharePropertyDocDto,
  ) {
    const property = await this.propertyModel.findById(dto.property);
    if (!property) {
      throw new NotFoundException("This property doesn't exist");
    }
    if (
      property.seller.toString() !== user.id &&
      property.sellerAgent.toString() !== user.id
    ) {
      throw new UnauthorizedException(
        'You are not permitted to perform this action.',
      );
    }
    let shareToken: null | string = null;
    while (!shareToken) {
      shareToken = generateReferralCode(16);
      const tokenExists = await this.sharePropertyDocModel.findOne({
        shareToken,
      });
      if (tokenExists) shareToken = null;
    }

    const payload = {
      ...dto,
      seller: property?.seller,
      sellerAgent: property?.sellerAgent,
      property: property.id,
      shareToken,
    };

    const payloadModel = await this.sharePropertyDocModel.create(payload);
    const sharedDoc = await payloadModel.save();
    const document = await this.sharePropertyDocModel
      .findById(sharedDoc._id)
      .populate('seller')
      .populate('sellerAgent')
      .populate('property');

    const emailBody = {
      recipientName: dto.name,
      senderName: user?.firstname,
      documentLink: `${configs.SELF_BASE_URL}/property/property-documents/${sharedDoc._id}`,
    };
    await this.emailService.sendEmail({
      email: dto.email,
      subject: `Property Document Available`,
      template: 'property_document',
      body: emailBody,
    });
    return document;
  }

  async getAllSharedDocuments(user: User | Agent, id: string) {
    const property = await this.propertyModel.findById(id);
    if (!property) {
      throw new NotFoundException("This property doesn't exist");
    }
    if (
      property.seller.toString() !== user.id &&
      property.sellerAgent.toString() !== user.id
    ) {
      throw new UnauthorizedException(
        'You are not permitted to perform this action.',
      );
    }
    return await this.sharePropertyDocModel
      .find({
        property: property.id,
      })
      .populate('seller')
      .populate('sellerAgent')
      .populate('property')
      .sort({ createdAt: -1 })
      .exec();
  }

  async removeSharedDocumentAccess(user: User | Agent, id: string) {
    const document = await this.sharePropertyDocModel.findById(id);
    if (!document) {
      throw new NotFoundException("This document doesn't exist");
    }
    if (
      document.seller.toString() !== user.id &&
      document.sellerAgent.toString() !== user.id
    ) {
      throw new UnauthorizedException(
        'You are not permitted to perform this action.',
      );
    }
    await this.sharePropertyDocModel.findByIdAndDelete(id);
    return { success: true };
  }

  private async _getPropertyPercentage(id: string) {
    let percentageCompleted = 0;
    const property = await this.propertyModel.findById(id);
    const offer = await this.offerModel.findOne({
      property: property.id,
      currentStatus: {
        $nin: [
          OfferStatusEnum.rejected,
          OfferStatusEnum.submitted,
          OfferStatusEnum.pending,
        ],
      },
    });
    if (!offer) {
      switch (property.currentStatus) {
        case PropertyStatusEnum.pendingVerification:
          percentageCompleted = 0;
        case PropertyStatusEnum.properyOwnershipVerified:
          percentageCompleted = 25;
        case PropertyStatusEnum.notVerified:
          percentageCompleted = 0;
        case PropertyStatusEnum.sold:
          percentageCompleted = 100;
      }
      return percentageCompleted;
    } else {
      switch (offer.currentStatus) {
        case OfferStatusEnum.accepted:
          percentageCompleted = 50;
          break;
        case OfferStatusEnum.titleAndEscrow:
          percentageCompleted = 50;
        case OfferStatusEnum.trackingContingency:
          percentageCompleted = 75;
        case OfferStatusEnum.signAndClose:
          percentageCompleted = 90;
      }
      return percentageCompleted;
    }
  }

  async verifyPropertyOwnerShip(
    user: User | Agent,
    dto: CreatePropertyDTO,
    propertyId: string,
    userOrAgentModel: string,
  ) {
    const propertyExists = await this.propertyModel.findOne({
      $or: [
        {
          _id: new Types.ObjectId(propertyId),
          seller: new Types.ObjectId(user._id),
          isDeleted: { $ne: true },
        },
        {
          _id: new Types.ObjectId(propertyId),
          sellerAgent: new Types.ObjectId(user._id),
          isDeleted: { $ne: true },
        },
      ],
    });
    if (!propertyExists) {
      throw new NotFoundException('Property not found');
    }
    if (propertyExists?.propertyOwnershipDetails?.actionTime) {
      throw new BadRequestException('Property ownership already captured.');
    }

    const propertyDocs = dto.proofOfOwnership;
    for (const doc of propertyDocs) {
      const newDoc = {
        ...doc,
        userOrAgentModel,
        userOrAgent: user._id,
        property: new Types.ObjectId(propertyId),
      };
      const newDocument = await this.propertyDocumentRepo.create(newDoc);
      await newDocument.save();
    }

    return await this.propertyModel.findByIdAndUpdate(
      propertyExists._id,
      {
        propertyOwnershipDetails: {
          ...dto.propertyOwnershipDetails,
          actionTime: new Date(),
        },
      },
      {
        new: true,
      },
    );
  }

  async confirmUserPropertyConnection(userId: string, propertyId: string) {
    let canJoin = await this.propertyModel.findOne({
      $or: [
        {
          _id: new Types.ObjectId(propertyId),
          seller: new Types.ObjectId(userId),
          isDeleted: { $ne: true },
        },
        {
          _id: new Types.ObjectId(propertyId),
          buyer: new Types.ObjectId(userId),
          isDeleted: { $ne: true },
        },
        {
          _id: new Types.ObjectId(propertyId),
          sellerAgent: new Types.ObjectId(userId),
          isDeleted: { $ne: true },
        },
        {
          _id: new Types.ObjectId(propertyId),
          buyerAgent: new Types.ObjectId(userId),
          isDeleted: { $ne: true },
        },
      ],
    });
    if (canJoin) return true;
    canJoin = await this.offerModel.findOne({
      $or: [
        {
          _id: new Types.ObjectId(propertyId),
          seller: new Types.ObjectId(userId),
        },
        {
          _id: new Types.ObjectId(propertyId),
          buyer: new Types.ObjectId(userId),
        },
        {
          _id: new Types.ObjectId(propertyId),
          sellerAgent: new Types.ObjectId(userId),
        },
        {
          _id: new Types.ObjectId(propertyId),
          buyerAgent: new Types.ObjectId(userId),
        },
      ],
    });
    if (canJoin) return true;
    return false;
  }

  async createProperty(data: CreatePropertyDto, user: User): Promise<Property> {
    const newData = {
      ...data,
      propertyName: data.propertyAddressDetails.formattedAddress,
      seller: user.id,
    };
    const createdProperty = new this.propertyModel(newData);
    const result = createdProperty.save();
    return result;
  }

  async addOfferComment(dto: PropertyOfferComment, user: User | Agent) {
    const offerExist = await this.offerModel.findById(dto.offerId);
    if (!offerExist) {
      throw new NotFoundException('Offer not found');
    }
    const newComment = {
      comment: dto.comment,
      offer: new Types.ObjectId(dto.offerId),
      user: user._id,
      agent: user._id,
    };
    const saved = await this.offerCommentModel.create(newComment);
    await saved.save();
    const comment = await this.offerCommentModel
      .findById(saved._id)
      .populate('user')
      .populate('agent')
      .populate('offer')
      .exec();
    return comment;
  }

  async getPropertyAnalytics(propertyId: string) {
    const property = await this.propertyModel.findOne({
      _id: new Types.ObjectId(propertyId),
      isDeleted: { $ne: true },
    });
    if (!property) {
      throw new NotFoundException('Property not found.');
    }
    const [totalClients, totalOffers] = await Promise.all([
      this.agentPropertyInviteModel.countDocuments({
        property: new Types.ObjectId(propertyId),
      }),
      this.offerModel.countDocuments({
        property: new Types.ObjectId(propertyId),
      }),
    ]);
    return {
      viewsCount: property?.viewsCounter ?? 0,
      totalClients,
      totalOffers,
      shareCount: property?.shareCounter ?? 0,
    };
  }

  async agentOrSellerAddTourSchedule(
    user: User | Agent,
    dto: PropertyTourScheduleDto,
  ) {
    const property = await this.propertyModel.findOne({
      _id: new Types.ObjectId(dto.property),
      isDeleted: { $ne: true },
      $or: [
        {
          seller: user._id,
        },
        {
          sellerAgent: user._id,
        },
      ],
    });
    if (!property) {
      throw new NotFoundException('Property not found.');
    }
    const newSchedule = {
      ...dto,
      property: new Types.ObjectId(dto.property),
      seller: property.seller,
      sellerAgent: property.sellerAgent,
    };
    const saved = await this.propertyTourScheduleModel.create(newSchedule);
    await saved.save();
    const schedule = await this.propertyTourScheduleModel
      .findById(saved._id)
      .populate('property')
      .populate('seller')
      .populate('sellerAgent')
      .exec();
    return schedule;
  }

  async agentOrSellerUpdateTourSchedule(
    id: string,
    user: User | Agent,
    dto: UpdatePropertyTourScheduleDto,
  ) {
    const propertyTourSchedule = await this.propertyTourScheduleModel.findOne({
      _id: new Types.ObjectId(id),
      $or: [
        {
          seller: user._id,
        },
        {
          sellerAgent: user._id,
        },
      ],
    });
    if (!propertyTourSchedule) {
      throw new NotFoundException('Property Tour Schedule not found.');
    }

    const schedule = await this.propertyTourScheduleModel
      .findByIdAndUpdate(propertyTourSchedule._id, dto, { new: true })
      .populate('property')
      .populate('seller')
      .populate('sellerAgent')
      .exec();
    return schedule;
  }

  async agentOrSellerDeleteTourSchedule(id: string, user: User | Agent) {
    const propertyTourSchedule = await this.propertyTourScheduleModel.findOne({
      _id: new Types.ObjectId(id),
      $or: [
        {
          seller: user._id,
        },
        {
          sellerAgent: user._id,
        },
      ],
    });
    if (!propertyTourSchedule) {
      throw new NotFoundException('Property Tour Schedule not found.');
    }
    await this.propertyTourScheduleModel.findByIdAndDelete(
      propertyTourSchedule._id,
    );
    return true;
  }

  async getAgentOrSellerTourSchedules(
    paginationDto: PaginationDto,
    user: User | Agent,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    // const query = {
    //   eventDate: { $gte: new Date() },
    //   $or: [
    //     {
    //       seller: user._id,
    //     },
    //     {
    //       sellerAgent: user._id,
    //     },
    //   ],
    // };
    // const [result, total] = await Promise.all([
    //   this.propertyTourScheduleModel
    //     .find(query)
    //     .populate('seller')
    //     .populate('sellerAgent')
    //     .populate('property')
    //     .skip(skip)
    //     .limit(limit)
    //     .exec(),
    //   this.propertyTourScheduleModel.countDocuments(query),
    // ]);
    const pipeline: any = [
      {
        $match: {
          eventDate: { $gte: new Date() },
          $or: [{ seller: user._id }, { sellerAgent: user._id }],
        },
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'property',
          foreignField: '_id',
          as: 'property',
        },
      },
      {
        $unwind: {
          path: '$property',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'seller',
          foreignField: '_id',
          as: 'seller',
        },
      },
      {
        $unwind: {
          path: '$seller',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'agents',
          localField: 'sellerAgent',
          foreignField: '_id',
          as: 'sellerAgent',
        },
      },
      {
        $unwind: {
          path: '$sellerAgent',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          'property.currentStatus': {
            $in: [
              PropertyStatusEnum.pendingVerification,
              PropertyStatusEnum.nowShowing,
            ],
          },
        },
      },
      {
        $addFields: {
          dayOfWeek: {
            $dayOfWeek: '$eventDate',
          },
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { eventDate: 1 } },
            { $skip: skip || 0 },
            { $limit: limit || 10 },
          ],
        },
      },
      {
        $unwind: {
          path: '$metadata',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          total: '$metadata.total',
          data: 1,
        },
      },
    ];

    const pipelineResult =
      await this.propertyTourScheduleModel.aggregate(pipeline);
    const { total, data } = pipelineResult[0];
    return { result: data, total, page, limit };
  }

  async sellerOrAgentPublishOrUnpublishProperty(
    id: string,
    user: User | Agent,
    dto: SellerOrAgentPublishPropertyDto,
  ) {
    const { publish } = dto;

    const property = await this.propertyModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: { $ne: true },
      $or: [
        {
          seller: user._id,
        },
        {
          sellerAgent: user._id,
        },
      ],
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const positiveMessage = `published your property, you can now expect offers on your ${property.propertyName} property.`;
    const negetiveMessage = `unpublished your property, there will be no new offers on your ${property.propertyName} property.`;
    if (
      [
        PropertyStatusEnum.properyOwnershipVerified,
        PropertyStatusEnum.unpublished,
      ].includes(property.currentStatus as PropertyStatusEnum) &&
      publish
    ) {
      const update = await this.propertyModel.findByIdAndUpdate(
        id,
        {
          currentStatus: PropertyStatusEnum.nowShowing,
          $push: {
            status: {
              status: PropertyStatusEnum.nowShowing,
              eventTime: new Date(),
            },
          },
        },
        { new: true },
      );

      if (property.sellerAgent) {
        await this.notificationService.createNotification({
          body: `${user.fullname}, just ${publish ? positiveMessage : negetiveMessage}`,
          title: `${user.fullname}, just ${publish ? 'published' : 'unpublished'} your property.`,
          user: property.sellerAgent as any,
          userType: NotificationUserType.agent,
        });
      }
      if (property.seller) {
        await this.notificationService.createNotification({
          body: `${user.fullname}, just ${publish ? positiveMessage : negetiveMessage}`,
          title: `${user.fullname}, just ${publish ? 'published' : 'unpublished'} your property.`,
          user: property.seller as any,
          userType: NotificationUserType.user,
        });
      }
      return update;
    }
    if (property.currentStatus == PropertyStatusEnum.nowShowing && !publish) {
      const update = await this.propertyModel.findByIdAndUpdate(
        id,
        {
          currentStatus: PropertyStatusEnum.unpublished,
          $push: {
            status: {
              status: PropertyStatusEnum.unpublished,
              eventTime: new Date(),
            },
          },
        },
        { new: true },
      );
      if (property.sellerAgent) {
        await this.notificationService.createNotification({
          body: `${user.fullname}, just ${publish ? positiveMessage : negetiveMessage}`,
          title: `${user.fullname}, just ${publish ? 'published' : 'unpublished'} your property.`,
          user: property.sellerAgent as any,
          userType: NotificationUserType.agent,
        });
      }
      if (property.seller) {
        await this.notificationService.createNotification({
          body: `${user.fullname}, just ${publish ? positiveMessage : negetiveMessage}`,
          title: `${user.fullname}, just ${publish ? 'published' : 'unpublished'} your property.`,
          user: property.seller as any,
          userType: NotificationUserType.user,
        });
      }
      return update;
    }
    throw new BadRequestException(
      'You can not publish this property at this time.',
    );
  }

  async getOfferComment(
    paginationDto: PaginationDto,
    id: string,
    user: User | Agent,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const query = {
      offer: new Types.ObjectId(id),
      $or: [
        {
          user: user._id,
        },
        {
          agent: user._id,
        },
      ],
    };
    const [result, total] = await Promise.all([
      this.offerCommentModel
        .find(query)
        .populate('user')
        .populate('agent')
        .populate('offer')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.offerCommentModel.countDocuments(query),
    ]);
    return { result, total, page, limit };
  }

  async agentCreateProperty(
    data: AgentCreatePropertyDto,
    user: Agent,
  ): Promise<Property> {
    const newData = {
      ...data,
      propertyName: data.propertyAddressDetails.formattedAddress,
      sellerAgent: user.id,
      propertyAddressDetails: data.propertyAddressDetails,
    };
    const createdProperty = new this.propertyModel(newData);
    const result = createdProperty.save();
    return result;
  }

  async savePropertySearchResult(
    dto: SavePropertyQueryDTO,
    user: Agent | User,
  ) {
    const model = await this.propertyQueryModel.create({
      ...dto,
      user: user._id,
      agent: user._id,
    });
    await model.save();
  }

  async buyerOfferResponse(dto: OfferResponseDto, user: User) {
    const accepted = dto.response;
    const counterOffer = await this.offerModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(dto.counterOfferId),
          buyer: user.id,
          offerType: OfferTypeEnum.counterOffer,
        },
        {
          $set: {
            currentStatus: dto.response
              ? OfferStatusEnum.accepted
              : OfferStatusEnum.rejected,
          },
          $push: {
            status: {
              status: dto.response
                ? OfferStatusEnum.accepted
                : OfferStatusEnum.rejected,
              eventTime: new Date(),
            },
          },
        },
        { new: true },
      )
      .populate('seller')
      .populate('sellerAgent')
      .populate('buyerAgent')
      .populate('property');
    if (!counterOffer) {
      throw new NotFoundException('Offer not found');
    }
    const buyerOffer = await this.offerModel.findById(counterOffer._id);
    if (!buyerOffer) {
      throw new NotFoundException("Buyer's Offer not found");
    }
    if (accepted) {
      const update = await this.offerModel.findByIdAndUpdate(
        buyerOffer._id,
        {
          $set: { currentStatus: OfferStatusEnum.titleAndEscrow },
          $push: {
            status: {
              status: OfferStatusEnum.titleAndEscrow,
              eventTime: new Date(),
            },
          },
        },
        {
          new: true,
        },
      );
      await this.propertyModel.findOneAndUpdate(
        { _id: counterOffer.property, isDeleted: { $ne: true } },
        {
          $set: {
            currentStatus: PropertyStatusEnum.underContract,
          },
          $push: {
            status: {
              status: PropertyStatusEnum.underContract,
              eventTime: new Date(),
            },
          },
        },
      );
      if (counterOffer.seller) {
        await this.emailService.sendEmail({
          email: counterOffer.seller.email,
          subject: `Property Offer  Accepted For ${counterOffer.property.propertyName}`,
          template: 'offer_accepted',
          body: {
            name: counterOffer.seller.lastname,
            offerPrice: counterOffer.offerPrice.amount,
            Status: 'Accepted',
            propertyAddress:
              counterOffer.property?.propertyAddressDetails?.formattedAddress,
          },
        });
      }
      if (counterOffer?.sellerAgent) {
        await this.emailService.sendEmail({
          email: counterOffer.sellerAgent.email,
          subject: `Property Offer Accepted For ${counterOffer.property.propertyName}`,
          template: 'offer_accepted',
          body: {
            name: counterOffer.sellerAgent.lastname,
            offerPrice: counterOffer.offerPrice.amount,
            Status: 'Accepted',
            propertyAddress:
              counterOffer.property?.propertyAddressDetails?.formattedAddress,
          },
        });
      }

      return update;
    }
    const update = await this.offerModel.findOneAndUpdate(
      { _id: buyerOffer._id, isDeleted: { $ne: true } },
      {
        $set: { currentStatus: OfferStatusEnum.rejected },
        $push: {
          status: {
            status: OfferStatusEnum.rejected,
            eventTime: new Date(),
          },
        },
      },
      {
        new: true,
      },
    );
    await this.emailService.sendEmail({
      email: counterOffer.seller.email,
      subject: `Property Offer  Rejected For ${counterOffer.property.propertyName}`,
      template: 'offer_rejected',
      body: {
        name: counterOffer.seller.lastname,
        offerPrice: counterOffer.counterOffer.offerPrice.amount,
        Status: 'Rejected',
        propertyAddress:
          counterOffer.property?.propertyAddressDetails?.formattedAddress,
      },
    });
    if (counterOffer?.seller) {
      await this.emailService.sendEmail({
        email: counterOffer.seller.email,
        subject: `Property Offer Rejected For ${counterOffer.property.propertyName}`,
        template: 'offer_rejected',
        body: {
          name: counterOffer.seller.lastname,
          offerPrice: counterOffer.offerPrice.amount,
          Status: 'Rejected',
          propertyAddress:
            counterOffer.property?.propertyAddressDetails?.formattedAddress,
        },
      });
    }
    if (counterOffer?.sellerAgent) {
      await this.emailService.sendEmail({
        email: counterOffer.sellerAgent.email,
        subject: `Property Offer Rejected For ${counterOffer.property.propertyName}`,
        template: 'offer_rejected',
        body: {
          name: counterOffer.sellerAgent.lastname,
          offerPrice: counterOffer.offerPrice.amount,
          Status: 'Rejected',
          propertyAddress:
            counterOffer.property?.propertyAddressDetails?.formattedAddress,
        },
      });
    }

    return update;
  }

  async createUserPropertyOffer(
    data: CreateUserOfferDto,
    user: User,
  ): Promise<Offer> {
    const offerCreated = await this.offerModel
      .find({
        $or: [
          { property: new Types.ObjectId(data.property), buyer: user },
          {
            property: new Types.ObjectId(data.property),
            buyerAgent: data?.buyerAgent,
          },
        ],
      })
      .populate(['buyer', 'seller', 'sellerAgent', 'buyerAgent'])
      .exec();
    const property = await this.propertyModel
      .findById(data.property)
      .populate(['buyer', 'seller', 'sellerAgent', 'buyerAgent'])
      .exec();
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    if (offerCreated.length > 0) {
      const updatedOffer = await this.offerModel.findByIdAndUpdate(
        offerCreated[0]._id,
        {
          ...data,
        },
      );
      if (updatedOffer?.buyerAgent) {
        await this.notificationService.createNotification({
          body: `${user.fullname}, just update their offer for ${property.propertyName} property.`,
          title: `Property Offer Updated`,
          user: new Types.ObjectId(data.buyerAgent) as any,
          userType: NotificationUserType.agent,
        });
        if (updatedOffer?.buyerAgent.email) {
          await this.emailService.sendEmail({
            email: updatedOffer?.buyerAgent?.email,
            subject: `Property Offer Updated`,
            template: 'offer_updated',
            body: {
              name: updatedOffer?.buyerAgent.fullname,
              offerPrice: `${data.offerPrice.currency}data.offerPrice.amount`,
              offerStatus: 'Pending-Acceptance',
              propertyAddress: property.propertyName,
            },
          });
        }
      }
      if (updatedOffer?.seller) {
        await this.notificationService.createNotification({
          body: `${user.fullname}, just update their offer for ${property.propertyName} property.`,
          title: `Property Offer Updated`,
          user: new Types.ObjectId(property.seller?.id) as any,
          userType: NotificationUserType.user,
        });
        if (updatedOffer?.seller?.email) {
          await this.emailService.sendEmail({
            email: updatedOffer?.seller.email,
            subject: `Property Offer Updated`,
            template: 'offer_updated',
            body: {
              name: updatedOffer?.seller.fullname,
              offerPrice: `${data.offerPrice.currency}data.offerPrice.amount`,
              offerStatus: 'Pending-Acceptance',
              propertyAddress: property.propertyName,
            },
          });
        }
      }
      if (updatedOffer?.sellerAgent) {
        await this.notificationService.createNotification({
          body: `${user.fullname}, just update their offer for ${property.propertyName} property.`,
          title: `Property Offer Updated`,
          user: new Types.ObjectId(property.sellerAgent?.id) as any,
          userType: NotificationUserType.agent,
        });
        if (updatedOffer.sellerAgent.email) {
          await this.emailService.sendEmail({
            email: updatedOffer?.sellerAgent.email,
            subject: `Property Offer Updated`,
            template: 'offer_updated',
            body: {
              name: updatedOffer?.sellerAgent.fullname,
              offerPrice: `${data.offerPrice.currency}data.offerPrice.amount`,
              offerStatus: 'Pending-Acceptance',
              propertyAddress: property.propertyName,
            },
          });
        }
      }
      return updatedOffer;
    }
    const canCreateOffer = [
      PropertyStatusEnum.pendingVerification,
      PropertyStatusEnum.nowShowing,
    ].includes(property.currentStatus as PropertyStatusEnum);
    if (!canCreateOffer) {
      throw new BadRequestException(
        'You can not make an offer for this property at this time.',
      );
    }
    const newData = {
      ...data,
      buyer: user,
      buyerAgent: data.buyerAgent ? new Types.ObjectId(data.buyerAgent) : null,
      offerCreator: OfferCreatorTypeEnum.buyer,
      seller: property?.seller,
      sellerAgent: property?.sellerAgent,
    };
    const savedOffer = await this.offerModel.create(newData);
    const result = await savedOffer.save();
    const newOffer = await this.offerModel
      .findById(result._id)
      .populate(['buyer', 'seller', 'sellerAgent', 'buyerAgent'])
      .exec();
    if (newOffer?.buyerAgent) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just created a new offer for a ${property.propertyName} property.`,
        title: `New property offer from ${user.fullname}`,
        user: newOffer.buyerAgent?.id,
        userType: NotificationUserType.agent,
      });
    }
    if (newOffer?.buyerAgent) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just update their offer for ${property.propertyName} property.`,
        title: `Property Offer Updated`,
        user: newOffer.buyerAgent?.id,
        userType: NotificationUserType.agent,
      });
      if (newOffer?.buyerAgent?.email) {
        await this.emailService.sendEmail({
          email: property?.buyerAgent.email,
          subject: `Property Offer Updated`,
          template: 'offer_updated',
          body: {
            name: property?.buyerAgent.fullname,
            offerPrice: `${data.offerPrice.currency}data.offerPrice.amount`,
            offerStatus: 'Pending-Acceptance',
            propertyAddress: property.propertyName,
          },
        });
      }
    }
    if (property?.seller?.email) {
      const emailBody = {
        propertyName: property.propertyName,
        name: property?.seller.fullname,
        offerPrice: `${data.offerPrice.currency}${data.offerPrice.amount}`,
        offerDate: new Date(),
      };
      await this.notificationService.createNotification({
        body: `${user.fullname}, just created an offer for ${property.propertyName} property.`,
        title: `Property Offer Created`,
        user: new Types.ObjectId(property.seller?.id) as any,
        userType: NotificationUserType.user,
      });
      await this.emailService.sendEmail({
        email: property?.seller.email,
        subject: `Property Offer Created`,
        template: 'buyer_create_offer',
        body: emailBody,
      });
    }
    if (property?.sellerAgent?.email) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just created an offer for ${property.propertyName} property.`,
        title: `Property Offer Created`,
        user: property.sellerAgent?.id,
        userType: NotificationUserType.agent,
      });
      if (property?.sellerAgent.email) {
        const emailBody = {
          propertyName: property.propertyName,
          name: property?.sellerAgent.fullname,
          offerPrice: `${data.offerPrice.currency}${data.offerPrice.amount}`,
          offerDate: new Date(),
        };

        await this.emailService.sendEmail({
          email: property?.sellerAgent.email,
          subject: `Property Offer Created`,
          template: 'buyer_create_offer',
          body: emailBody,
        });
      }
    }
    if (property?.buyerAgent?.email) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just created an offer for ${property.propertyName} property.`,
        title: `Property Offer Created`,
        user: property?.buyerAgent?.id,
        userType: NotificationUserType.agent,
      });
      if (property?.buyerAgent?.email) {
        const emailBody = {
          propertyName: property.propertyName,
          name: property?.sellerAgent.fullname,
          offerPrice: `${data.offerPrice.currency}${data.offerPrice.amount}`,
          offerDate: new Date(),
        };
        await this.emailService.sendEmail({
          email: property?.buyerAgent.email,
          subject: `Property Offer Created`,
          template: 'buyer_create_offer',
          body: emailBody,
        });
      }
    }
    return result;
  }

  async sellerCreateOrUpdateCounterOffer(
    data: CreateCounterOfferDto,
    offerId: string,
    user: User,
  ): Promise<Offer> {
    const buyerOffer = await this.offerModel
      .findById(offerId)
      .populate(['buyer', 'seller', 'sellerAgent'])
      .exec();
    if (buyerOffer?.seller?.id.toString() !== user.id.toString()) {
      throw new UnauthorizedException(
        'You are not permitted to perform this action',
      );
    }
    if (buyerOffer.currentStatus !== OfferStatusEnum.submitted) {
      throw new BadRequestException(
        'You can not make a counter offer for this property at this time.',
      );
    }
    const property = await this.propertyModel.findOne({
      _id: buyerOffer.property,
      isDeleted: { $ne: true },
    });
    if (!property) {
      throw new NotFoundException('Property not found.');
    }
    const previousOffer = await this.offerModel.findOne({
      property: buyerOffer.property,
      $or: [
        { buyer: buyerOffer?.buyer },
        { buyerAgent: buyerOffer?.buyerAgent },
      ],
      counterOffer: buyerOffer._id,
      offerType: OfferTypeEnum.counterOffer,
    });

    if (!previousOffer) {
      const newCounterOffer = await this.offerModel.create({
        ...data,
        counterOffer: buyerOffer._id,
        offerType: OfferTypeEnum.counterOffer,
        buyer: buyerOffer?.buyer,
        buyerAgent: buyerOffer?.buyerAgent,
        offerCreator: OfferCreatorTypeEnum.seller,
        property: buyerOffer.property,
        seller: property?.seller,
      });
      const createdPropertyOffer = new this.offerModel(newCounterOffer);
      const result = createdPropertyOffer.save();
      return result;
    }
    const update = await this.offerModel.findByIdAndUpdate(
      previousOffer._id,
      data,
      {
        new: true,
      },
    );
    return update;
  }

  async sellerAgentCreateOrUpdateCounterOffer(
    data: CreateCounterOfferDto,
    offerId: string,
    user: Agent,
  ): Promise<Offer> {
    const buyerOffer = await this.offerModel
      .findById(offerId)
      .populate(['buyer', 'seller', 'sellerAgent'])
      .exec();
    if (buyerOffer?.sellerAgent?.id.toString() !== user._id.toString()) {
      throw new UnauthorizedException(
        'You are not permitted to perform this action',
      );
    }
    if (buyerOffer.currentStatus !== OfferStatusEnum.submitted) {
      throw new BadRequestException(
        'You can not make a counter offer for this property at this time.',
      );
    }
    const property = await this.propertyModel.findById({
      _id: buyerOffer.property,
      isDeleted: { $ne: true },
    });
    if (!property) {
      throw new NotFoundException('Property not found.');
    }
    const previousOffer = await this.offerModel.findOne({
      property: buyerOffer.property,
      $or: [
        { buyer: buyerOffer?.buyer },
        { buyerAgent: buyerOffer?.buyerAgent },
      ],
      counterOffer: buyerOffer._id,
      offerType: OfferTypeEnum.counterOffer,
    });

    if (!previousOffer) {
      const newCounterOffer = await this.offerModel.create({
        ...data,
        counterOffer: buyerOffer._id,
        offerType: OfferTypeEnum.counterOffer,
        buyer: buyerOffer?.buyer,
        buyerAgent: buyerOffer?.buyerAgent,
        offerCreator: OfferCreatorTypeEnum.agent,
        property: buyerOffer.property,
        seller: property?.seller,
      });
      const createdPropertyOffer = new this.offerModel(newCounterOffer);
      const result = createdPropertyOffer.save();
      return result;
    }
    const update = await this.offerModel.findByIdAndUpdate(
      previousOffer._id,
      data,
      {
        new: true,
      },
    );
    return update;
  }

  async buyerSubmitOffer(offerId: string, user: User): Promise<Offer> {
    const offer = await this.offerModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(offerId),
          buyer: user.id,
          $or: [
            { currentStatus: OfferStatusEnum.pending },
            { currentStatus: OfferStatusEnum.submitted },
          ],
        },
        {
          currentStatus: OfferStatusEnum.submitted,
          $push: {
            status: {
              status: OfferStatusEnum.submitted,
              eventTime: new Date(),
            },
          },
        },
        {
          new: true,
        },
      )
      .populate(['buyer', 'seller', 'sellerAgent', 'buyerAgent'])
      .exec();
    if (!offer || offer?.buyer.id.toString() != user.id.toString()) {
      throw new NotFoundException('Offer not found');
    }
    const property = await this.propertyModel
      .findById(offer.property)
      .populate(['buyer', 'seller', 'sellerAgent', 'buyerAgent'])
      .exec();
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const canCreateOffer = [
      PropertyStatusEnum.pendingVerification,
      PropertyStatusEnum.properyOwnershipVerified,
      PropertyStatusEnum.nowShowing,
    ].includes(property.currentStatus as PropertyStatusEnum);
    if (!canCreateOffer) {
      console.log(canCreateOffer, property.currentStatus);
      throw new BadRequestException(
        'You can not make an offer for this property at this time.',
      );
    }
    if (offer?.buyerAgent && offer.buyerAgent?.email) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just submited a new offer for ${property.propertyName} property.`,
        title: `Property Offer Submitted`,
        user: offer?.buyerAgent?.id,
        userType: NotificationUserType.agent,
      });

      const emailBody = {
        propertyName: property.propertyName,
        name: offer?.buyerAgent.fullname,
        propertyPrice: `${offer.offerPrice.currency}${offer.offerPrice.amount}`,
        offerDate: new Date(),
      };
      await this.emailService.sendEmail({
        email: offer?.buyerAgent.email,
        subject: `Property Offer Submitted`,
        template: 'buyer_create_offer',
        body: emailBody,
      });
    }
    if (offer?.seller && offer.seller?.email) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just submited a new offer for ${property.propertyName} property.`,
        title: `New Property Offer`,
        user: offer?.seller?.id,
        userType: NotificationUserType.user,
      });

      const emailBody = {
        propertyName: property.propertyName,
        name: offer?.seller.fullname,
        propertyPrice: `${offer.offerPrice.currency}${offer.offerPrice.amount}`,
        offerDate: new Date(),
      };
      await this.emailService.sendEmail({
        email: offer?.seller.email,
        subject: `New Property Offer`,
        template: 'buyer_create_offer',
        body: emailBody,
      });
    }
    if (offer?.sellerAgent && offer.sellerAgent?.email) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just submited a new offer for ${property.propertyName} property.`,
        title: `New Property Offer`,
        user: offer.sellerAgent?.id,
        userType: NotificationUserType.agent,
      });
      const emailBody = {
        propertyName: property.propertyName,
        name: offer?.seller.fullname,
        propertyPrice: `${offer.offerPrice.currency}${offer.offerPrice.amount}`,
        offerDate: new Date(),
      };
      await this.emailService.sendEmail({
        email: offer?.sellerAgent.email,
        subject: `New Property Offer`,
        template: 'buyer_create_offer',
        body: emailBody,
      });
    }
    return offer;
  }

  async addOfferCoBuyer(
    user: User | Agent,
    offerId: string,
    dto: AddPropertyCoBuyerDto,
  ) {
    const offerExist = await this.offerModel.findOne({
      _id: new Types.ObjectId(offerId),
      $or: [
        {
          buyer: user.id,
        },
        {
          buyerAgent: user.id,
        },
      ],
    });
    if (!offerExist) {
      throw new NotFoundException('offer not found');
    }
    return await this.offerModel.findByIdAndUpdate(
      offerId,
      {
        $push: {
          coBuyers: dto,
        },
      },
      {
        new: true,
      },
    );
  }
  async createAgentPropertyOffer(
    data: CreateAgentPropertyOfferDto,
    user: Agent,
  ): Promise<Offer> {
    const property = await this.propertyModel
      .findById(data.property)
      .populate(['buyer', 'seller', 'sellerAgent', 'buyerAgent'])
      .exec();
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const offerCreated = await this.offerModel.findOne({
      property: property._id,
      buyerAgent: user._id,
      offerType: OfferTypeEnum.buyerOffer,
    });
    const canCreateOffer = [
      PropertyStatusEnum.pendingVerification,
      PropertyStatusEnum.properyOwnershipVerified,
      PropertyStatusEnum.nowShowing,
    ].includes(property.currentStatus as PropertyStatusEnum);
    if (!canCreateOffer) {
      throw new BadRequestException(
        'You can not make an offer for this property at this time.',
      );
    }
    if (offerCreated) {
      const updatedOffer = await this.offerModel
        .findByIdAndUpdate(offerCreated._id, {
          ...data,
        })
        .populate(['buyer', 'seller', 'sellerAgent', 'buyerAgent'])
        .exec();
      if (updatedOffer?.buyer) {
        await this.notificationService.createNotification({
          body: `${user.fullname}, just updated an offer for ${property.propertyName} property.`,
          title: `Property Offer Updated`,
          user: updatedOffer?.buyer?.id,
          userType: NotificationUserType.user,
        });
        await this.emailService.sendEmail({
          email: updatedOffer?.buyer.email,
          subject: `Property Offer Updated`,
          template: 'offer_updated',
          body: {
            name: updatedOffer?.buyer.fullname,
            offerPrice: `${data.offerPrice.currency}data.offerPrice.amount`,
            offerStatus: 'Pending-Acceptance',
            propertyAddress: property.propertyName,
          },
        });
      }
      // if (updatedOffer?.seller) {
      //   await this.notificationService.createNotification({
      //     body: `${user.fullname}, just update their offer for ${property.propertyName} property.`,
      //     title: `Property Offer Updated`,
      //     user: updatedOffer.seller._id,
      //     userType: NotificationUserType.user,
      //   });
      //   await this.emailService.sendEmail({
      //     email: updatedOffer?.seller.email,
      //     subject: `Property Offer Updated`,
      //     template: 'offer_updated',
      //     body: {
      //       name: updatedOffer?.seller.fullname,
      //       offerPrice: `${data.offerPrice.currency}data.offerPrice.amount`,
      //       offerStatus: 'Pending-Acceptance',
      //       propertyAddress: property.propertyName,
      //     },
      //   });
      // }
      // if (updatedOffer?.sellerAgent) {
      //   await this.notificationService.createNotification({
      //     body: `${user.fullname}, just update their offer for ${property.propertyName} property.`,
      //     title: `Property Offer Updated`,
      //     user: updatedOffer.sellerAgent._id,
      //     userType: NotificationUserType.agent,
      //   });
      //   await this.emailService.sendEmail({
      //     email: updatedOffer?.sellerAgent.email,
      //     subject: `Property Offer Updated`,
      //     template: 'offer_updated',
      //     body: {
      //       name: updatedOffer?.sellerAgent.fullname,
      //       offerPrice: `${data.offerPrice.currency}data.offerPrice.amount`,
      //       offerStatus: 'Pending-Acceptance',
      //       propertyAddress: property.propertyName,
      //     },
      //   });
      // }
    }

    const newData = {
      ...data,
      buyer: property?.buyer,
      buyerAgent: user._id,
      offerCreator: OfferCreatorTypeEnum.agent,
      seller: property?.seller,
      sellerAgent: property?.sellerAgent,
    };
    const dataToSave = new this.offerModel(newData);
    const newOffer = await dataToSave.save();
    if (newOffer?.buyer) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just update their offer for ${property.propertyName} property.`,
        title: `Property Offer Updated`,
        user: newOffer?.buyer?.id,
        userType: NotificationUserType.agent,
      });
      await this.emailService.sendEmail({
        email: newOffer.buyer.email,
        subject: `Property Offer Updated`,
        template: 'offer_updated',
        body: {
          name: newOffer?.buyer.fullname,
          offerPrice: `${data.offerPrice.currency}data.offerPrice.amount`,
          offerStatus: 'Pending-Acceptance',
          propertyAddress: property.propertyName,
        },
      });
    }
    // if (property?.seller) {
    //   const emailBody = {
    //     propertyName: property.propertyName,
    //     name: property?.seller.fullname,
    //     offerPrice: `${data.offerPrice.currency}${data.offerPrice.amount}`,
    //     offerDate: new Date(),
    //   };
    //   await this.notificationService.createNotification({
    //     body: `${user.fullname}, just created an offer for ${property.propertyName} property.`,
    //     title: `Property Offer Created`,
    //     user: new Types.ObjectId(property.seller._id) as any,
    //     userType: NotificationUserType.user,
    //   });
    //   await this.emailService.sendEmail({
    //     email: property?.seller.email,
    //     subject: `Property Offer Created`,
    //     template: 'buyer_create_offer',
    //     body: emailBody,
    //   });
    // }
    // if (property?.sellerAgent) {
    //   const emailBody = {
    //     propertyName: property.propertyName,
    //     name: property?.sellerAgent.fullname,
    //     offerPrice: `${data.offerPrice.currency}${data.offerPrice.amount}`,
    //     offerDate: new Date(),
    //   };

    //   await this.notificationService.createNotification({
    //     body: `${user.fullname}, just created an offer for ${property.propertyName} property.`,
    //     title: `Property Offer Created`,
    //     user: property.sellerAgent._id,
    //     userType: NotificationUserType.agent,
    //   });
    //   await this.emailService.sendEmail({
    //     email: property?.sellerAgent.email,
    //     subject: `Property Offer Created`,
    //     template: 'buyer_create_offer',
    //     body: emailBody,
    //   });
    // }
    // if (property?.buyerAgent) {
    //   const emailBody = {
    //     propertyName: property.propertyName,
    //     name: property?.sellerAgent.fullname,
    //     offerPrice: `${data.offerPrice.currency}${data.offerPrice.amount}`,
    //     offerDate: new Date(),
    //   };

    //   await this.notificationService.createNotification({
    //     body: `${user.fullname}, just created an offer for ${property.propertyName} property.`,
    //     title: `Property Offer Created`,
    //     user: property?.buyerAgent._id,
    //     userType: NotificationUserType.agent,
    //   });
    //   await this.emailService.sendEmail({
    //     email: property?.buyerAgent.email,
    //     subject: `Property Offer Created`,
    //     template: 'buyer_create_offer',
    //     body: emailBody,
    //   });
    // }
    return newOffer;
  }

  async buyerAgentSubmitOffer(user: Agent, offerId: string): Promise<Offer> {
    const offer = await this.offerModel
      .findById(offerId)
      .populate(['buyer', 'seller', 'sellerAgent', 'buyerAgent'])
      .exec();

    if (!offer || offer?.buyerAgent !== user._id) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.currentStatus !== OfferStatusEnum.pending) {
      throw new BadRequestException('Offer already submitted');
    }
    const property = await this.propertyModel
      .findById(offer.property)
      .populate(['buyer', 'seller', 'sellerAgent', 'buyerAgent'])
      .exec();
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    await this.offerModel.findByIdAndUpdate(
      offerId,
      {
        currentStatus: OfferStatusEnum.submitted,
        seller: property?.seller,
        sellerAgent: user._id,
        agentApproval: true,
        agentApprovalDate: new Date().toUTCString(),
        $push: {
          status: {
            status: OfferStatusEnum.submitted,
            eventTime: new Date(),
          },
        },
      },
      {
        new: true,
      },
    );
    const canCreateOffer = [
      PropertyStatusEnum.pendingVerification,
      PropertyStatusEnum.properyOwnershipVerified,
      PropertyStatusEnum.nowShowing,
    ].includes(property.currentStatus as PropertyStatusEnum);
    if (!canCreateOffer) {
      console.log(canCreateOffer, property.currentStatus);
      throw new BadRequestException(
        'You can not make an offer for this property at this time.',
      );
    }
    if (offer?.buyer && offer?.buyer?.email) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just submited a new offer for ${property.propertyName} property.`,
        title: `Property Offer Submitted`,
        user: offer.buyer?.id,
        userType: NotificationUserType.agent,
      });
      const emailBody = {
        propertyName: property.propertyName,
        name: offer?.buyer.fullname,
        propertyPrice: `${offer.offerPrice.currency}${offer.offerPrice.amount}`,
        offerDate: new Date(),
      };
      await this.emailService.sendEmail({
        email: offer?.buyer.email,
        subject: `Property Offer Submitted`,
        template: 'buyer_create_offer',
        body: emailBody,
      });
    }
    if (offer?.seller && offer?.seller?.email) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just submited a new offer for ${property.propertyName} property.`,
        title: `New Property Offer`,
        user: offer.seller?.id,
        userType: NotificationUserType.user,
      });
      const emailBody = {
        propertyName: property.propertyName,
        name: offer?.seller.fullname,
        propertyPrice: `${offer.offerPrice.currency}${offer.offerPrice.amount}`,
        offerDate: new Date(),
      };
      await this.emailService.sendEmail({
        email: offer?.seller.email,
        subject: `New Property Offer`,
        template: 'buyer_create_offer',
        body: emailBody,
      });
    }
    if (offer?.sellerAgent && offer?.sellerAgent?.email) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just submited a new offer for ${property.propertyName} property.`,
        title: `Property Offer Updated`,
        user: offer.sellerAgent?.id,
        userType: NotificationUserType.agent,
      });
      const emailBody = {
        propertyName: property.propertyName,
        name: offer?.seller.fullname,
        propertyPrice: `${offer.offerPrice.currency}${offer.offerPrice.amount}`,
        offerDate: new Date(),
      };
      await this.emailService.sendEmail({
        email: offer?.sellerAgent.email,
        subject: `New Property Offer`,
        template: 'buyer_create_offer',
        body: emailBody,
      });
    }
    return offer;
  }

  async queryPropertiesByAddress(UnparsedAddress: string) {
    const savedQueries = await this.propertyQueryModel.find({
      UnparsedAddress: new RegExp(new RegExp(UnparsedAddress, 'i'), 'i'),
    });
    if (savedQueries.length > 0) {
      return savedQueries.map((x) => this.mapPropertyQueryToProperty(x));
    }
    const encodedParams = new URLSearchParams();
    encodedParams.set('grant_type', 'client_credentials');
    encodedParams.set('client_id', configs.MLS_CLIENT_ID);
    encodedParams.set('client_secret', configs.MLS_CLIENT_SECRET);

    const config = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'accept-cncoding': 'gzip, deflate, br',
        accept: '*/*',
      },
    };
    const propertResponse = await this.axiosInstance.post(
      'https://realtyfeed-sso.auth.us-east-1.amazoncognito.com/oauth2/token',
      encodedParams,
      config,
    );
    const access_token = propertResponse.data.access_token;
    try {
      // const self_url =
      //   configs.ENVIRONMENT == 'production'
      //     ? 'https://prod.api.ocreal.online/'
      //     : 'https://dev.api.ocreal.online/';
      const headers = {
        'x-api-key': configs.MLS_API_AUTH_KEY,
        Authorization: 'Bearer ' + access_token,
        Origin: 'https://prod.api.ocreal.online/',
        Referer: 'https://dev.api.ocreal.online/',
      };

      const propertyResponse = await axios.get(
        `https://api.realtyfeed.com/reso/odata/Property?$filter=contains(UnparsedAddress, '${UnparsedAddress}')&top=10`,
        // https://api.realtyfeed.com/reso/odata/Property?$select=ALL&$filter=contains(UnparsedAddress, '1714 Mccadden Place Unit 3421, Los Angeles, California 90028')
        {
          headers,
        },
      );
      const properties = propertyResponse.data.value;
      // if (properties.length > 0) {
      //   await this.propertyQueryModel.insertMany(properties);
      // }
      return properties.map((x: PropertyQuery) =>
        this.mapPropertyQueryToProperty(x),
      );
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        'Something went wrong, please try again later.',
      );
    }
  }

  async scheduleTour(data: CreateTourDto, user: User): Promise<PropertyTour> {
    const property = await this.propertyModel.findById({
      _id: data.property,
      isDeleted: { $ne: true },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (property.currentStatus !== PropertyStatusEnum.nowShowing) {
      throw new BadRequestException(
        'You can no longer tour this property as it currently under contract',
      );
    }
    const currentDate = new Date();
    for (const date of data.eventDate) {
      if (date.eventDate < currentDate) {
        throw new BadRequestException(
          `You can not book ${date.eventDate}, as it is a date in the past`,
        );
      }
    }

    const tourPayload = {
      ...data,
      buyer: user,
      seller: property?.seller,
      sellerAgent: property.sellerAgent,
    };
    const propertyTour = new this.propertyTourModel(tourPayload);
    const savedTour = await propertyTour.save();

    const formattedDate = moment(savedTour.eventDate[0].eventDate).format(
      'ddd D MMM YYYY',
    );
    await this.notificationService.createNotification({
      body: `${user.fullname}, just scheduled a tour of your ${property.propertyName} property, for ${formattedDate}`,
      title: `New Property Tour Schduled for ${property.propertyName}`,
      user: property.sellerAgent as any,
      userType: NotificationUserType.agent,
    });

    if (property.seller) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just scheduled a tour of your ${property.propertyName} property, for ${formattedDate}`,
        title: `New Property Tour Schduled for ${property.propertyName}`,
        user: property.seller as any,
      });
    }

    await this.notificationService.createNotification({
      body: `${user.fullname}, just scheduled a tour of your ${property.propertyName} property, for ${formattedDate}`,
      title: `New Property Tour Schduled for ${property.propertyName}`,
      user: property.buyerAgent as any,
      userType: NotificationUserType.agent,
    });
    return savedTour;
  }

  async saveUserProperty(propertyId: string, user: User) {
    const property = await this.propertyModel.findById({
      _id: new Types.ObjectId(propertyId),
      isDeleted: { $ne: true },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const alreadySaved = await this.userSavedPropertyModel.findOne({
      user: user.id,
      property: new Types.ObjectId(propertyId),
    });
    if (alreadySaved) {
      throw new BadRequestException('This property has already been saved');
    }
    const savedProperty = await this.userSavedPropertyModel.create({
      user: user.id,
      property: new Types.ObjectId(propertyId),
    });
    return savedProperty.save();
  }

  async getAgentUpcomingTours(paginationDto: PaginationDto, agent: Agent) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [result, total] = await Promise.all([
      this.propertyTourModel
        .find({ sellerAgent: agent.id })
        .populate('buyer')
        .populate('seller')
        .populate('property')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyTourModel.countDocuments({ sellerAgent: agent.id }),
    ]);

    return { result, total, page, limit };
  }

  async getAgentPropertyinvites(paginationDto: PaginationDto, agent: Agent) {
    const { page = 1, limit = 10, invitedBy } = paginationDto;
    if (!invitedBy) {
      throw new BadRequestException(
        'invitedBy query params missing in your request.',
      );
    }
    const skip = (page - 1) * limit;
    const query = invitedBy ? { inviteAccountType: invitedBy } : {};
    const [result, total] = await Promise.all([
      this.agentPropertyInviteModel
        .find({
          currentStatus: AgentPropertyInviteStatusEnum.pending,
          email: agent.email,
          ...query,
        })
        .populate('invitedBy')
        .populate('property')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.agentPropertyInviteModel.countDocuments({
        currentStatus: AgentPropertyInviteStatusEnum.pending,
        email: agent.email,
        ...query,
      }),
    ]);

    return { result, total, page, limit };
  }

  async getAgentInvites(paginationDto: PaginationDto, agent: Agent) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [result, total] = await Promise.all([
      this.agentPropertyInviteModel
        .find({ email: agent.email })
        .populate('invitedBy')
        .populate('property')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.agentPropertyInviteModel.countDocuments({ email: agent.email }),
    ]);

    return { result, total, page, limit };
  }

  async updateProperty(
    data: UpdatePropertyDto,
    user: any,
    id: string,
  ): Promise<Property> {
    const property = await this.propertyModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ seller: user.id }, { sellerAgent: user.id }],
      isDeleted: { $ne: true },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const updatedProperty = await this.propertyModel.findByIdAndUpdate(
      property.id,
      data,
      { new: true },
    );
    return updatedProperty;
  }

  async getSingleOffer(id: string) {
    const offer = await this.offerModel
      .findById(id)
      .populate('buyer')
      .populate('seller')
      .populate('property')
      .populate('sellerAgent')
      .populate('buyerAgent');

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async getAPropertyOffers(paginationDto: PaginationDto, id: string) {
    const { page = 1, limit = 10, financeType, min, max } = paginationDto;
    const skip = (page - 1) * limit;

    const query: any = {
      property: new Types.ObjectId(id),
      currentStatus: OfferStatusEnum.submitted,
    };

    if (min && max) {
      query['offerPrice.amount'] = {
        $gte: +min,
        $lte: +max,
      };
    } else if (max && !min) {
      query['offerPrice.amount'] = {
        $lte: +max,
      };
    } else if (min && !max) {
      query['offerPrice.amount'] = {
        $gte: +min,
      };
    }

    if (financeType) {
      query.financeType = financeType;
    }
    const [result, total] = await Promise.all([
      this.offerModel
        .find(query)
        .populate('buyer')
        .populate('seller')
        .populate('property')
        .populate('sellerAgent')
        .populate('buyerAgent')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.offerModel.countDocuments(query),
    ]);
    const payload = [];
    for (const offer of result) {
      const offerCommentCount = await this.offerCommentModel
        .countDocuments({
          offer: offer.id,
        })
        .lean();
      payload.push({
        ...offer,
        offerCommentCount,
      });
    }

    return { result: payload, total, page, limit };
  }

  async addAgentToProperty(
    user: User,
    user_role: AccountTypeEnum,
    data: AddAgentToPropertyDto,
  ): Promise<AgentPropertyInvite> {
    const agent = await this.agentModel.findOne({ email: data.agentEmail });
    const alreadyInvited = await this.agentPropertyInviteModel.findOne({
      invitedBy: user.id,
      email: data.agentEmail,
      property: new Types.ObjectId(data.propertyId),
    });

    const agentAlreadyAccepted = await this.agentPropertyInviteModel.findOne({
      invitedBy: user.id,
      currentStatus: AgentPropertyInviteStatusEnum.accepted,
      property: new Types.ObjectId(data.propertyId),
    });

    if (agentAlreadyAccepted) {
      throw new BadRequestException(
        'Another Agent has already accepted an invite to this property',
      );
    }

    if (alreadyInvited) {
      throw new BadRequestException(
        'An invite has already been sent to this agent',
      );
    }
    const property = await this.propertyModel.findById({
      _id: new Types.ObjectId(data.propertyId),
      isDeleted: { $ne: true },
    });
    const agentRole =
      user_role == AccountTypeEnum.BUYER ? 'Buying Agent' : 'Selling Agent';
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    if (property.sellerAgent && user_role == AccountTypeEnum.SELLER) {
      throw new BadRequestException(
        'An agent has already been added to this property',
      );
    } else if (property.buyerAgent && user_role == AccountTypeEnum.BUYER) {
      throw new BadRequestException(
        'An agent has already been added to this property',
      );
    }

    const newPropertyInvite = {
      inviteAccountType: user_role,
      invitedBy: user,
      email: data.agentEmail,
      property: property.id,
      agent: agent ? agent.id : null,
    };

    const propertyAgentinvite =
      await this.agentPropertyInviteModel.create(newPropertyInvite);
    await this.emailService.sendEmail({
      email: data.agentEmail,
      subject: 'Agent Property Invitation',
      template: 'agent_invite',
      body: {
        inviterName: user.fullname,
        lactionUrl: `${configs.BASE_URL}/agent/accept-invite?propertyInviteId=${propertyAgentinvite._id.toString()}`,
      },
    });
    //TODO: send notifications at this point

    if (agent) {
      await this.notificationService.createNotification({
        body: `${user.fullname}, just just invited you act as their ${agentRole} on ${property.propertyName} property.`,
        title: `New ${agentRole} Property Invite`,
        user: agent.id as any,
        userType: NotificationUserType.agent,
      });
    }
    return propertyAgentinvite.save();
  }

  async getUserBuyingProperties(paginationDto: PaginationDto, user: User) {
    const {
      page = 1,
      limit = 10,
      search,
      priceMin,
      priceMax,
      sqTfMin,
      sqTfMax,
      bedRooms,
      features,
      propertyType,
    } = paginationDto;

    const skip = (page - 1) * limit;
    let query;
    if (search) {
      query = {
        $or: [
          {
            numBathroom: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            lotSizeUnit: new RegExp(new RegExp(search, 'i'), 'i'),
          },

          {
            propertyType: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'features.feature': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            propertyName: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'mobile.raw_mobile': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'propertyAddressDetails.formattedAddress': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.city': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.state': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.streetName': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
        ],
      };
    }

    const queryParam: any = search
      ? {
          ...query,
        }
      : {};

    if (propertyType) {
      queryParam.propertyType = propertyType;
    }
    if (priceMax) {
      queryParam.price.$gte = priceMax;
    }
    if (priceMin) {
      queryParam.price.$lte = priceMin;
    }
    if (sqTfMax) {
      queryParam.lotSizeValue.$gte = sqTfMax;
    }
    if (sqTfMin) {
      queryParam.lotSizeValue.$lte = sqTfMin;
    }
    if (bedRooms) {
      queryParam.numBedroom.$gte = bedRooms;
    }
    if (features) {
      const featuresArray = features.split(',');
      queryParam['features'] = {
        $elemMatch: {
          feature: { $in: featuresArray },
        },
      };
    }

    const dataPipeline = [
      {
        $match: {
          invitedBy: user._id,
          inviteAccountType: 'buyer',
        },
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'property',
          foreignField: '_id',
          as: 'property',
        },
      },
      {
        $unwind: {
          path: '$property',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: { ...queryParam },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];
    const countPipeline = [
      {
        $match: {
          invitedBy: user._id,
          inviteAccountType: 'buyer',
        },
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'property',
          foreignField: '_id',
          as: 'property',
        },
      },
      {
        $unwind: {
          path: '$property',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: { ...queryParam },
      },
      { $group: { _id: null, total: { $sum: 1 } } },
    ];

    const facet = [
      {
        $facet: {
          data: dataPipeline,
          total: countPipeline,
        },
      },
    ];

    const result = await this.agentPropertyInviteModel.aggregate(facet);
    const { data, total } = result[0];
    const mappedData = [];
    for (const r of data.map((x: AgentPropertyInvite) => x.property)) {
      const percentageCompleted = await this._getPropertyPercentage(r._id);
      mappedData.push({
        ...r.toObject(),
        percentageCompleted,
      });
    }
    return {
      result: mappedData,
      total: total[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async getUserSellingProperties(paginationDto: PaginationDto, user: User) {
    const {
      page = 1,
      limit = 10,
      search,
      priceMin,
      priceMax,
      sqTfMin,
      sqTfMax,
      bedRooms,
      features,
      propertyType,
    } = paginationDto;

    const skip = (page - 1) * limit;
    let query;
    if (search) {
      query = {
        $or: [
          {
            numBathroom: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            lotSizeUnit: new RegExp(new RegExp(search, 'i'), 'i'),
          },

          {
            propertyType: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'features.feature': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            propertyName: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'mobile.raw_mobile': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'propertyAddressDetails.formattedAddress': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.city': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.state': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.streetName': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
        ],
      };
    }

    const queryData = search
      ? {
          seller: user._id.toString(),
          ...query,
        }
      : {
          seller: user._id.toString(),
        };

    const queryParam: any = {
      seller: user._id,
      ...queryData,
      isDeleted: { $ne: true },
    };
    if (propertyType) {
      queryParam.propertyType = propertyType;
    }
    if (priceMax) {
      queryParam.price.$gte = priceMax;
    }
    if (priceMin) {
      queryParam.price.$lte = priceMin;
    }
    if (sqTfMax) {
      queryParam.lotSizeValue.$gte = sqTfMax;
    }
    if (sqTfMin) {
      queryParam.lotSizeValue.$lte = sqTfMin;
    }
    if (bedRooms) {
      queryParam.numBedroom.$gte = bedRooms;
    }
    if (features) {
      const featuresArray = features.split(',');
      queryParam['features'] = {
        $elemMatch: {
          feature: { $in: featuresArray },
        },
      };
    }

    const [result, total] = await Promise.all([
      this.propertyModel
        .find(queryParam)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyModel.countDocuments(queryParam),
    ]);
    const data = [];
    for (const r of result) {
      const percentageCompleted = await this._getPropertyPercentage(r._id);
      data.push({
        ...r.toObject(),
        percentageCompleted,
      });
    }
    return { result: data, total, page, limit };
  }

  async deleteSingleProperty(id: string, user: User | Agent) {
    const property = await this.propertyModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: { $ne: true },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    if (
      property?.seller?.id &&
      property?.seller?.id.toString() !== user?.id.toString() &&
      property?.sellerAgent &&
      property?.sellerAgent?.id.toString() !== user.id.toString()
    ) {
      throw new UnauthorizedException(
        'You are not authorized to delete this property',
      );
    }

    await this.propertyModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    return true;
  }

  async sellerOrSellerAgentResponsetoOffer(
    dto: SellerOrSellerAgentAcceptOffer,
    user: User | Agent,
  ) {
    const offer = await this.offerModel
      .findById(dto.offerId)
      .populate('buyer')
      .populate('seller')
      .populate('property')
      .populate('sellerAgent')
      .populate('buyerAgent')
      .exec();

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    console.log(offer);
    if (
      offer.seller?.id.toString() !== user?.id.toString() &&
      offer.sellerAgent?.id.toString() !== user?.id.toString()
    ) {
      throw new UnauthorizedException(
        'You are not authorized to respond to this offer',
      );
    }

    if (offer.currentStatus !== OfferStatusEnum.submitted) {
      throw new BadRequestException('You can not respond to this offer');
    }

    if (dto.response) {
      if (offer.seller) {
        await this.emailService.sendEmail({
          email: offer.seller.email,
          subject: 'Offer Accepted',
          template: 'offer_accepted',
          body: {
            name: offer.seller.fullname,
            propertyAddress: offer.property.propertyName,
            propertyName: offer.property.propertyName,
            offerPrice: offer.offerPrice.amount,
          },
        });
        await this.notificationService.createNotification({
          body: `${user.fullname}, just accpted an offer for this ${offer.property.propertyName} property.`,
          title: `Offer Accepted`,
          user: user._id,
          userType: NotificationUserType.user,
        });
      }

      if (offer.sellerAgent) {
        await this.emailService.sendEmail({
          email: offer.sellerAgent.email,
          subject: 'Offer Accepted',
          template: 'offer_accepted',
          body: {
            name: offer.sellerAgent.fullname,
            propertyAddress: offer.property.propertyName,
            propertyName: offer.property.propertyName,
            offerPrice: offer.offerPrice.amount,
          },
        });
        await this.notificationService.createNotification({
          body: `${user.fullname}, just accpted an offer for this ${offer.property.propertyName} property.`,
          title: `Offer Accepted`,
          user: offer.sellerAgent?.id,
          userType: NotificationUserType.agent,
        });
      }

      if (offer.buyer) {
        await this.emailService.sendEmail({
          email: offer.buyer.email,
          subject: dto.header,
          template: `buyer_template_offer_accpted`,
          body: {
            name: offer.buyer.fullname,
            propertyAddress: offer.property.propertyName,
            propertyName: offer.property.propertyName,
            offerPrice: offer.offerPrice.amount,
            message: dto.body,
          },
        });
        await this.notificationService.createNotification({
          body: `${user.fullname}, just accepted your offer for this ${offer.property.propertyName} property.`,
          title: `Offer Accepted`,
          user: offer.buyer?.id,
          userType: NotificationUserType.user,
        });
      }
      if (offer.buyerAgent) {
        await this.emailService.sendEmail({
          email: offer.buyerAgent.email,
          subject: dto.header,
          template: 'buyer_template_offer_accpted',
          body: {
            name: offer.buyerAgent.fullname,
            propertyAddress: offer.property.propertyName,
            propertyName: offer.property.propertyName,
            offerPrice: offer.offerPrice.amount,
            message: dto.body,
          },
        });
        await this.notificationService.createNotification({
          body: `${user.fullname}, just accepted your offer for this ${offer.property.propertyName} property.`,
          title: `Offer Accepted`,
          user: offer.buyerAgent?.id,
          userType: NotificationUserType.agent,
        });
      }
      await this.offerModel.updateMany(
        { property: offer.property._id },
        {
          currentStatus: OfferStatusEnum.rejected,
          $push: {
            status: {
              eventTime: new Date(),
              status: OfferStatusEnum.rejected,
            },
          },
        },
      );
      await this.offerModel
        .findByIdAndUpdate(
          offer._id,
          {
            currentStatus: OfferStatusEnum.accepted,
            $push: {
              status: {
                eventTime: new Date(),
                status: OfferStatusEnum.accepted,
              },
            },
          },
          {
            new: true,
          },
        )
        .exec();
      const udpatedOffer = await this.offerModel
        .findByIdAndUpdate(
          offer._id,
          {
            currentStatus: OfferStatusEnum.titleAndEscrow,
            $push: {
              status: {
                eventTime: new Date(),
                status: OfferStatusEnum.titleAndEscrow,
              },
            },
          },
          {
            new: true,
          },
        )
        .populate('buyer')
        .populate('seller')
        .populate('property')
        .populate('sellerAgent')
        .populate('buyerAgent')
        .exec();
      const buyers = await this.offerModel.distinct('buyer', {
        property: offer.property._id,
      });
      const buyerAgents = await this.offerModel.distinct('buyerAgent', {
        property: offer.property._id,
      });
      const uniqueBuyers: any = Array.from(new Set(buyers)).filter((id) => id);
      const uniqueBuyerAgents: any = Array.from(new Set(buyerAgents)).filter(
        (id) => id,
      );

      if (uniqueBuyers.length > 0) {
        await this.notificationService.createMultipleNotifications({
          body: `${user.fullname}, just accepted your offer for this ${offer.property.propertyName} property.`,
          title: `Offer Accepted`,
          user: uniqueBuyers,
          userType: NotificationUserType.user,
        });
      }

      if (uniqueBuyerAgents.length > 0) {
        await this.notificationService.createMultipleNotifications({
          body: `${user.fullname}, just accepted your offer for this ${offer.property.propertyName} property.`,
          title: `Offer Accepted`,
          user: uniqueBuyers,
          userType: NotificationUserType.agent,
        });
      }

      return udpatedOffer;
    } else {
      if (offer.seller) {
        await this.emailService.sendEmail({
          email: offer.seller.email,
          subject: 'Offer Rejected',
          template: 'offer_rejected',
          body: {
            name: offer.seller.fullname,
            propertyAddress: offer.property.propertyName,
            propertyName: offer.property.propertyName,
            offerPrice: offer.offerPrice.amount,
          },
        });
        await this.notificationService.createNotification({
          body: `${user.fullname}, just rejected an offer for this ${offer.property.propertyName} property.`,
          title: `Offer Rejected`,
          user: offer.seller?.id,
          userType: NotificationUserType.user,
        });
      }

      if (offer.sellerAgent) {
        await this.emailService.sendEmail({
          email: offer.sellerAgent.email,
          subject: 'Offer Rejected',
          template: 'offer_rejected',
          body: {
            name: offer.sellerAgent.fullname,
            propertyAddress: offer.property.propertyName,
            propertyName: offer.property.propertyName,
            offerPrice: offer.offerPrice.amount,
          },
        });
        await this.notificationService.createNotification({
          body: `${user.fullname}, just rejected an offer for this ${offer.property.propertyName} property.`,
          title: `Offer Rejected`,
          user: offer.sellerAgent?.id,
          userType: NotificationUserType.agent,
        });
      }

      if (offer.buyer) {
        await this.emailService.sendEmail({
          email: offer.buyer.email,
          subject: dto.header,
          template: 'offer_rejected',
          body: {
            name: offer.buyer.fullname,
            propertyAddress: offer.property.propertyName,
            propertyName: offer.property.propertyName,
            offerPrice: offer.offerPrice.amount,
            message: dto.body,
          },
        });
        await this.notificationService.createNotification({
          body: `${user.fullname}, just rejected your offer for this ${offer.property.propertyName} property.`,
          title: `Offer Rejected`,
          user: offer.buyer?.id,
          userType: NotificationUserType.user,
        });
      }
      if (offer.buyerAgent) {
        await this.emailService.sendEmail({
          email: offer.buyerAgent.email,
          subject: dto.header,
          template: 'offer_rejected',
          body: {
            name: offer.buyerAgent.fullname,
            propertyAddress: offer.property.propertyName,
            propertyName: offer.property.propertyName,
            offerPrice: offer.offerPrice.amount,
            message: dto.body,
          },
        });
        await this.notificationService.createNotification({
          body: `${user.fullname}, just rejected your offer for this ${offer.property.propertyName} property.`,
          title: `Offer Rejected`,
          user: offer.buyerAgent?.id,
          userType: NotificationUserType.agent,
        });
      }

      const udpatedOffer = await this.offerModel
        .findByIdAndUpdate(
          offer._id,
          {
            currentStatus: OfferStatusEnum.rejected,
            $push: {
              status: {
                eventTime: new Date(),
                status: OfferStatusEnum.rejected,
              },
            },
          },
          { new: true },
        )
        .populate('buyer')
        .populate('seller')
        .populate('property')
        .populate('sellerAgent')
        .populate('buyerAgent')
        .exec();
      return udpatedOffer;
    }
  }

  async buyerOrAgentCompleteOfferTitleAndEscrow(
    user: User | Agent,
    offerId: string,
  ) {
    const offer = await this.offerModel
      .findById(offerId)
      .populate('buyer')
      .populate('seller')
      .populate('property')
      .populate('sellerAgent')
      .populate('buyerAgent')
      .exec();

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    if (
      offer.buyer?._id.toString() !== user?._id.toString() &&
      offer.buyerAgent?._id.toString() !== user?._id.toString()
    ) {
      throw new UnauthorizedException(
        'You are not authorized to respond to this offer',
      );
    }

    if (offer.currentStatus !== OfferStatusEnum.titleAndEscrow) {
      throw new BadRequestException(
        'You can not perform this action on this offer at this stage.',
      );
    }

    const updatedOffer = await this.offerModel
      .findByIdAndUpdate(
        offerId,
        {
          currentStatus: OfferStatusEnum.trackingContingency,
          $push: {
            status: {
              eventTime: new Date(),
              status: OfferStatusEnum.trackingContingency,
            },
          },
        },
        {
          new: true,
        },
      )
      .populate('buyer')
      .populate('seller')
      .populate('property')
      .populate('sellerAgent')
      .populate('buyerAgent');
    if (updatedOffer.seller) {
      console.log('seller Sent');
      await this.emailService.sendEmail({
        email: updatedOffer.seller.email,
        subject: 'Title And Escrow Stage Completed',
        template: 'completed_title&escrow',
        body: {
          name: updatedOffer.seller.fullname,
          propertyAddress: updatedOffer.property.propertyName,
        },
      });
      await this.notificationService.createNotification({
        body: `${user.fullname}, just completed the "Title And Escrow" stae of this ${updatedOffer.property.propertyName} property.`,
        title: `Offer Rejected`,
        user: updatedOffer.seller.id,
        userType: NotificationUserType.user,
      });
    }

    if (updatedOffer.sellerAgent) {
      console.log('seller Agent Sent');
      await this.emailService.sendEmail({
        email: updatedOffer.sellerAgent.email,
        subject: 'Title And Escrow Stage Completed',
        template: 'completed_title&escrow',
        body: {
          name: updatedOffer.sellerAgent.fullname,
          propertyAddress: updatedOffer.property.propertyName,
        },
      });
      await this.notificationService.createNotification({
        body: `${user.fullname}, just completed the "Title And Escrow" stae of this ${updatedOffer.property.propertyName} property.`,
        title: `Offer Rejected`,
        user: updatedOffer.sellerAgent?.id,
        userType: NotificationUserType.agent,
      });
    }

    if (updatedOffer.buyer) {
      console.log('buyer Sent');
      await this.emailService.sendEmail({
        email: updatedOffer.buyer.email,
        subject: 'Title And Escrow Stage Completed',
        template: 'completed_title&escrow',
        body: {
          name: updatedOffer.buyer.fullname,
          propertyAddress: updatedOffer.property.propertyName,
        },
      });
      await this.notificationService.createNotification({
        body: `${user.fullname}, just completed the "Title And Escrow" stae of this ${updatedOffer.property.propertyName} property.`,
        title: `Offer Rejected`,
        user: updatedOffer.buyer?.id,
        userType: NotificationUserType.user,
      });
    }
    if (updatedOffer.buyerAgent) {
      console.log('buyer agent Sent');
      await this.emailService.sendEmail({
        email: updatedOffer.buyerAgent.email,
        subject: 'Title And Escrow Stage Completed',
        template: 'completed_title&escrow',
        body: {
          name: updatedOffer.buyerAgent.fullname,
          propertyAddress: updatedOffer.property.propertyName,
          propertyName: updatedOffer.property.propertyName,
        },
      });
      await this.notificationService.createNotification({
        body: `${user.fullname}, just completed the "Title And Escrow" stae of this ${updatedOffer.property.propertyName} property.`,
        title: `Offer Rejected`,
        user: updatedOffer.buyerAgent?.id,
        userType: NotificationUserType.agent,
      });
    }
    return updatedOffer;
  }

  async getAgentBuyerProperties(paginationDto: PaginationDto, user: Agent) {
    const {
      page = 1,
      limit = 10,
      search,
      priceMin,
      priceMax,
      sqTfMin,
      sqTfMax,
      bedRooms,
      features,
      propertyType,
    } = paginationDto;

    const skip = (page - 1) * limit;
    let query;
    if (search) {
      query = {
        $or: [
          {
            numBathroom: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            lotSizeUnit: new RegExp(new RegExp(search, 'i'), 'i'),
          },

          {
            propertyType: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'features.feature': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            propertyName: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'mobile.raw_mobile': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'propertyAddressDetails.formattedAddress': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.city': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.state': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.streetName': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
        ],
      };
    }

    const queryData = search
      ? {
          buyerAgent: user.id,
          ...query,
        }
      : {
          buyerAgent: user.id,
        };

    const queryParam: any = {
      buyerAgent: user.id,
      ...queryData,
    };
    if (propertyType) {
      queryParam.propertyType = propertyType;
    }
    if (priceMax) {
      queryParam.price.$gte = priceMax;
    }
    if (priceMin) {
      queryParam.price.$lte = priceMin;
    }
    if (sqTfMax) {
      queryParam.lotSizeValue.$gte = sqTfMax;
    }
    if (sqTfMin) {
      queryParam.lotSizeValue.$lte = sqTfMin;
    }
    if (bedRooms) {
      queryParam.numBedroom.$gte = bedRooms;
    }
    if (features) {
      const featuresArray = features.split(',');
      queryParam['features'] = {
        $elemMatch: {
          feature: { $in: featuresArray },
        },
      };
    }

    const [result, total] = await Promise.all([
      this.propertyModel
        .find(queryParam)
        .skip(skip)
        .limit(limit)
        .populate(['sellerAgent', 'buyerAgent', 'buyer', 'seller'])
        .exec(),
      this.propertyModel.countDocuments(queryParam),
    ]);
    const mappedData = [];
    for (const r of result) {
      const percentageCompleted = await this._getPropertyPercentage(r._id);
      mappedData.push({
        ...r.toObject(),
        percentageCompleted,
      });
    }
    return { result: mappedData, total, page, limit };
  }

  async getAgentSellerProperties(paginationDto: PaginationDto, user: Agent) {
    const {
      page = 1,
      limit = 10,
      search,
      priceMin,
      priceMax,
      sqTfMin,
      sqTfMax,
      bedRooms,
      features,
      propertyType,
    } = paginationDto;

    const skip = (page - 1) * limit;
    let query;
    if (search) {
      query = {
        $or: [
          {
            numBathroom: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            lotSizeUnit: new RegExp(new RegExp(search, 'i'), 'i'),
          },

          {
            propertyType: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'features.feature': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            propertyName: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'mobile.raw_mobile': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'propertyAddressDetails.formattedAddress': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.city': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.state': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.streetName': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
        ],
      };
    }

    const queryData = search
      ? {
          sellerAgent: user.id,
          ...query,
        }
      : {
          sellerAgent: user.id,
        };

    const queryParam: any = {
      sellerAgent: user.id,
      ...queryData,
    };
    if (propertyType) {
      queryParam.propertyType = propertyType;
    }
    if (priceMax) {
      queryParam.price.$gte = priceMax;
    }
    if (priceMin) {
      queryParam.price.$lte = priceMin;
    }
    if (sqTfMax) {
      queryParam.lotSizeValue.$gte = sqTfMax;
    }
    if (sqTfMin) {
      queryParam.lotSizeValue.$lte = sqTfMin;
    }
    if (bedRooms) {
      queryParam.numBedroom.$gte = bedRooms;
    }
    if (features) {
      const featuresArray = features.split(',');
      queryParam['features'] = {
        $elemMatch: {
          feature: { $in: featuresArray },
        },
      };
    }

    const [result, total] = await Promise.all([
      this.propertyModel
        .find(queryParam)
        .skip(skip)
        .limit(limit)
        .populate(['sellerAgent', 'buyerAgent', 'buyer', 'seller'])
        .sort({
          createdAt: -1,
        })
        .exec(),
      this.propertyModel.countDocuments(queryParam),
    ]);
    const mappedData = [];
    for (const r of result) {
      const percentageCompleted = await this._getPropertyPercentage(r._id);
      mappedData.push({
        ...r.toObject(),
        percentageCompleted,
      });
    }
    return { result: mappedData, total, page, limit };
  }

  async getAgentIncomingPropertyOffers(
    paginationDto: PaginationDto,
    user: Agent,
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      priceMin,
      priceMax,
      sqTfMin,
      sqTfMax,
      bedRooms,
      features,
      propertyType,
    } = paginationDto;

    const skip = (page - 1) * limit;
    let query;
    if (search) {
      query = {
        $or: [
          {
            numBathroom: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            lotSizeUnit: new RegExp(new RegExp(search, 'i'), 'i'),
          },

          {
            propertyType: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'features.feature': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            propertyName: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'mobile.raw_mobile': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'propertyAddressDetails.formattedAddress': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.city': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.state': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'propertyAddressDetails.streetName': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
        ],
      };
    }

    const queryData = search
      ? {
          sellerAgent: user.id,
          ...query,
        }
      : {
          sellerAgent: user.id,
        };

    const queryParam: any = {
      sellerAgent: user.id,
      ...queryData,
    };
    if (propertyType) {
      queryParam.propertyType = propertyType;
    }
    if (priceMax) {
      queryParam.price.$gte = priceMax;
    }
    if (priceMin) {
      queryParam.price.$lte = priceMin;
    }
    if (sqTfMax) {
      queryParam.lotSizeValue.$gte = sqTfMax;
    }
    if (sqTfMin) {
      queryParam.lotSizeValue.$lte = sqTfMin;
    }
    if (bedRooms) {
      queryParam.numBedroom.$gte = bedRooms;
    }
    if (features) {
      const featuresArray = features.split(',');
      queryParam['features'] = {
        $elemMatch: {
          feature: { $in: featuresArray },
        },
      };
    }

    const [result, total] = await Promise.all([
      this.offerModel
        .find(queryParam)
        .skip(skip)
        .limit(limit)
        .populate(['sellerAgent', 'buyerAgent', 'buyer', 'seller', 'property'])
        .exec(),
      this.offerModel.countDocuments(queryParam),
    ]);

    return { result, total, page, limit };
  }

  async getAgentOutGoingPropertyOffers(
    paginationDto: PaginationDto,
    user: Agent,
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      priceMin,
      priceMax,
      sqTfMin,
      sqTfMax,
      bedRooms,
      features,
      propertyType,
    } = paginationDto;

    const skip = (page - 1) * limit;
    let query;
    if (search) {
      query = {
        $or: [
          {
            financeType: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            coverLetter: new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'loanAmount.currency': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'downPayment.currency': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'loanAmount.currency': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'documents.name': new RegExp(new RegExp(search, 'i'), 'i'),
          },
        ],
      };
    }

    const queryData = search
      ? {
          buyerAgent: user.id,
          ...query,
        }
      : {
          buyerAgent: user.id,
        };

    const queryParam: any = {
      buyerAgent: user.id,
      ...queryData,
    };
    if (propertyType) {
      queryParam.propertyType = propertyType;
    }
    if (priceMax) {
      queryParam.price.$gte = priceMax;
    }
    if (priceMin) {
      queryParam.price.$lte = priceMin;
    }
    if (sqTfMax) {
      queryParam.lotSizeValue.$gte = sqTfMax;
    }
    if (sqTfMin) {
      queryParam.lotSizeValue.$lte = sqTfMin;
    }
    if (bedRooms) {
      queryParam.numBedroom.$gte = bedRooms;
    }
    if (features) {
      const featuresArray = features.split(',');
      queryParam['features'] = {
        $elemMatch: {
          feature: { $in: featuresArray },
        },
      };
    }

    const [result, total] = await Promise.all([
      this.offerModel
        .find(queryParam)
        .skip(skip)
        .limit(limit)
        .populate(['sellerAgent', 'buyerAgent', 'buyer', 'seller', 'property'])
        .exec(),
      this.offerModel.countDocuments(queryParam),
    ]);

    return { result, total, page, limit };
  }

  async getUserFutureTours(paginationDto: PaginationDto, user: User) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        {
          buyer: user._id,
          'eventDate.eventDate': { $gte: new Date() },
        },
        {
          seller: user._id,
          'eventDate.eventDate': { $gte: new Date() },
        },
      ],
    };

    const [tours, total] = await Promise.all([
      this.propertyTourModel
        .find(query)
        .sort({ 'eventDate.eventDate': 1 })
        .populate('property')
        .populate('buyer')
        .populate('seller')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyTourModel.countDocuments(query),
    ]);

    return { tours, total, page, limit };
  }

  async getUserPastTours(paginationDto: PaginationDto, user: User) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        {
          buyer: user._id,
          'eventDate.eventDate': { $lte: new Date() },
        },
        {
          seller: user._id,
          'eventDate.eventDate': { $lte: new Date() },
        },
      ],
    };

    const [tours, total] = await Promise.all([
      this.propertyTourModel
        .find(query)
        .sort({ 'eventDate.eventDate': 1 })
        .populate('property')
        .populate('buyer')
        .populate('seller')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyTourModel.countDocuments(query),
    ]);

    return { tours, total, page, limit };
  }

  async agentAcceptInviteToProperty(agent: Agent, dto: AgentAcceptInviteDto) {
    const invite = await this.agentPropertyInviteModel
      .findOne({
        _id: new Types.ObjectId(dto.inviteId),
        agent: agent.id,
        // currentStatus: AgentPropertyInviteStatusEnum.pending,
      })
      .populate('invitedBy');

    if (!invite) {
      throw new NotFoundException('invite not found');
    }
    if (invite.currentStatus !== AgentPropertyInviteStatusEnum.pending) {
      throw new BadRequestException(
        `This invited has already been ${invite.currentStatus}.`,
      );
    }

    const property = await this.propertyModel
      .findById(invite.property)
      .populate(['seller', 'buyer']);
    const update: any = {};
    let user;
    if (dto.response == 'accepted') {
      if (invite?.inviteAccountType === AccountTypeEnum.SELLER) {
        if (property.sellerAgentAcceptance) {
          throw new BadRequestException(
            `A selling agent has already been added to to this property.`,
          );
        }
        property.status.push({
          status: PropertyStatusEnum.sellerAgentAcceptedInvite,
          eventTime: new Date(),
        });
        update.sellerAgent = agent;
        update.status = property.status;
        update.sellerAgentAcceptance = true;
        user = property.seller;
      } else if (invite?.inviteAccountType === AccountTypeEnum.BUYER) {
        if (property.buyerAgentAcceptance) {
          throw new BadRequestException(
            `A buying agent has already been added to to this property.`,
          );
        }
        update.buyerAgent = agent;
        property.status.push({
          status: PropertyStatusEnum.buyerAgentAcceptedInvite,
          eventTime: new Date(),
        });
        update.status = property.status;
        update.buyerAgentAcceptance = true;
        user = property.buyer;
      }
      await this.propertyModel.findOneAndUpdate(
        { _id: property._id, isDeleted: { $ne: true } },
        { ...update },
        { new: true },
      );
      const updatedInvite =
        await this.agentPropertyInviteModel.findByIdAndUpdate(
          dto.inviteId,
          {
            currentStatus: AgentPropertyInviteStatusEnum.accepted,
            $push: {
              status: {
                status: AgentPropertyInviteStatusEnum.accepted,
                eventTime: new Date(),
              },
            },
          },
          {
            new: true,
          },
        );
      if (user) {
        await this.emailService.sendEmail({
          email: user!.email,
          subject: 'Agent Accepted Your Invitation',
          template: 'agent_accepted_invite_to_user',
          body: {
            name: user!.fullname,
            property: property.propertyName,
            agentName: agent.fullname,
          },
        });

        await this.notificationService.createNotification({
          body: `${agent.fullname}, just accepted to act as your purchasing agent on this ${property.propertyName} property.`,
          title: `${agent.fullname}, just accepted your property invite.`,
          user: property.buyerAgent as any,
          // userType: NotificationUserType.agent,
        });
      }

      const alreadyAdded = agent.connectedUsers.includes(invite.invitedBy.id);
      if (!alreadyAdded) {
        await this.agentModel.findByIdAndUpdate(agent.id, {
          $push: {
            connectedUsers: invite.invitedBy.id,
          },
        });
      }
      return updatedInvite;
    } else if (dto.response == 'rejected') {
      if (invite?.inviteAccountType === AccountTypeEnum.SELLER) {
        user = property.seller;
      } else if (invite?.inviteAccountType === AccountTypeEnum.BUYER) {
        user = property.buyer;
      }
      if (user) {
        await this.emailService.sendEmail({
          email: user!.email,
          subject: 'Agent Rejected Your Invitation',
          template: 'agent_rejected_invite_to_user',
          body: {
            name: user!.fullname,
            property: property.propertyName,
            agentName: agent.fullname,
          },
        });
      }
      const updatedInvite =
        await this.agentPropertyInviteModel.findByIdAndUpdate(
          dto.inviteId,
          {
            currentStatus: AgentPropertyInviteStatusEnum.rejected,
            $push: {
              status: {
                status: AgentPropertyInviteStatusEnum.rejected,
                eventTime: new Date(),
              },
            },
          },
          {
            new: true,
          },
        );
      await this.notificationService.createNotification({
        body: `${agent.fullname}, just rejected to act as your selling agent on this ${property.propertyName} property.`,
        title: `${agent.fullname}, just rejected your property invite.`,
        user: property.buyerAgent as any,
        // userType: NotificationUserType.agent,
      });
      return updatedInvite;
    }
  }

  async publishProperty(agent: Agent, id: string) {
    const property = await this.propertyModel.findOne({
      _id: new Types.ObjectId(id),
      sellerAgent: agent.id,
      currentStatus: PropertyStatusEnum.pendingVerification,
      isDeleted: { $ne: true },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const update = await this.propertyModel.findByIdAndUpdate(
      property.id,
      {
        currentStatus: PropertyStatusEnum.nowShowing,
        $push: {
          status: {
            status: PropertyStatusEnum.nowShowing,
            eventTime: new Date(),
          },
        },
        listed: true,
      },
      {
        new: true,
      },
    );
    if (property.seller) {
      await this.notificationService.createNotification({
        body: `${agent.fullname}, just published your property, you can not expect offers on your ${property.propertyName} property.`,
        title: `${agent.fullname}, just published your property.`,
        user: property.buyerAgent as any,
        // userType: NotificationUserType.agent,
      });
    }
    return update;
  }

  async getSingleProperty(id: string) {
    const property = await this.propertyModel
      .findByIdAndUpdate(id, { $inc: { viewsCounter: 1 } }, { new: true })
      .populate('brokers.agent')
      .populate('sellerAgent', 'firstname lastname avatar')
      .populate('buyerAgent', 'firstname lastname avatar')
      .exec();

    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const percentageCompleted = await this._getPropertyPercentage(property._id);
    return { percentageCompleted, ...property.toObject() };
  }

  async getAllPropertyDocuments(
    user: User | Agent,
    propertyId: string,
    paginationDto: PaginationDto,
  ) {
    // confirm user access here
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;
    const query: any = {};
    if (search) {
      query['$or'] = [
        {
          name: new RegExp(new RegExp(search, 'i'), 'i'),
        },
        {
          documentType: new RegExp(new RegExp(search, 'i'), 'i'),
        },
      ];
    }
    const queryObject = search
      ? { ...query, property: new Types.ObjectId(propertyId) }
      : { property: new Types.ObjectId(propertyId) };
    console.log(queryObject);
    const [result, total] = await Promise.all([
      this.propertyDocumentRepo
        .find(queryObject)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyDocumentRepo.countDocuments(queryObject),
    ]);

    return { result, total, page, limit };
  }

  async addToPropertyRepo(
    user: User | Agent,
    userOrAgentModel: string,
    propertyId: string,
    dto: CreatePropertyDocumentDto,
  ) {
    const property = await this.propertyModel.findOne({
      _id: new Types.ObjectId(propertyId),
      isDeleted: { $ne: true },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const newDocument = await this.propertyDocumentRepo.create({
      ...dto,
      userOrAgentModel,
      userOrAgent: user._id,
      property: new Types.ObjectId(propertyId),
    });
    const saved = await newDocument.save();
    return saved;
  }

  async deletePropertyDocument(user: User | Agent, documentId: string) {
    const propertyDoc = await this.propertyDocumentRepo.findOne({
      _id: new Types.ObjectId(documentId),
      userOrAgent: user._id,
    });
    if (!propertyDoc) {
      throw new NotFoundException('Property Document not found');
    }
    await this.propertyDocumentRepo.findByIdAndDelete(propertyDoc._id);
    return true;
  }

  async getProperties(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;
    const query: any = {};
    if (search) {
      query['$or'] = [
        {
          propertyType: new RegExp(new RegExp(search, 'i'), 'i'),
        },
        {
          propertyName: new RegExp(new RegExp(search, 'i'), 'i'),
        },
        {
          'propertyAddressDetails.formattedAddress': new RegExp(
            new RegExp(search, 'i'),
            'i',
          ),
        },
        {
          'propertyAddressDetails.state': new RegExp(
            new RegExp(search, 'i'),
            'i',
          ),
        },
      ];
    }
    const queryObject = search
      ? { ...query, currentStatus: PropertyStatusEnum.nowShowing }
      : { currentStatus: PropertyStatusEnum.nowShowing };

    const [result, total] = await Promise.all([
      this.propertyModel
        .find(queryObject)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sellerAgent', 'firstname lastname')
        .exec(),
      this.propertyModel.countDocuments(queryObject),
    ]);
    // if (result.length === 0) {
    //   throw new BadRequestException('No properties at the moment');
    // }
    const mappedData = [];
    for (const r of result) {
      const percentageCompleted = await this._getPropertyPercentage(r._id);
      mappedData.push({
        ...r.toObject(),
        percentageCompleted,
      });
    }
    return { result: mappedData, total, page, limit };
  }

  async getAgentMostRecentTour(agent: Agent) {
    const tour = await this.propertyTourModel
      .findOne({
        sellerAgent: agent.id,
      })
      .sort({ updatedAt: -1 })
      .populate('buyer')
      .exec();
    if (!tour) {
      throw new NotFoundException('No tour found');
    }
    return tour;
  }

  // async searchForProperty(search: string, user: User) {
  //   const queryData = {
  //     $or: [
  //       {
  //         PropertyName: new RegExp(new RegExp(search, 'i'), 'i'),
  //       },
  //       {
  //         address: new RegExp(new RegExp(search, 'i'), 'i'),
  //       },
  //     ],
  //   };
  //   const query = await this.propertyQueryModel.findOne(queryData);
  //   if (query) {
  //     const days = calculateDaysBetweenDates(query.updatedAt, new Date());
  //     if (days <= 30) {
  //       return { record: query };
  //     }
  //     const requestResult = await this._requestPropertyData(search);
  //     console.log(requestResult);
  //     return query;
  //   }
  //   const record = await this._requestPropertyData(search);
  //   console.log(record);
  // }

  // async getAllPropertys(): Promise<Property[]> {
  //   return this.propertyModel.find().exec();
  // }

  // async getPropertyById(PropertyId: string): Promise<Property> {
  //   return this.propertyModel.findById(PropertyId);
  // }

  // async updateProperty(
  //   PropertyId: string,
  //   updatePropertyDto: UpdatePropertyDto,
  // ): Promise<Property> {
  //   return this.propertyModel.findByIdAndUpdate(PropertyId, updatePropertyDto, {
  //     new: true,
  //   });
  // }

  // async deleteProperty(PropertyId: string): Promise<any> {
  //   return this.propertyModel.findByIdAndRemove(PropertyId);
  // }

  // private async _requestPropertyData<T>(search: string): Promise<T> {
  //   // const headers = {
  //   //   Authorization: 'Bearer ' + configs.DATA_INFINITI_API_KEY,
  //   //   'Content-Type': 'application/json',
  //   // };
  //   const data = {
  //     json: {
  //       query: `address:${search}`,
  //       format: 'JSON',
  //       num_records: 1,
  //       download: false,
  //     },
  //   };
  //   const response: AxiosResponse<T> = await this.axiosInstance.post(
  //     'https://api.datafiniti.co/v4/properties/search',
  //     data,
  //   );
  //   return response.data;
  // }

  private mapPropertyQueryToProperty(query: PropertyQuery) {
    const images = [];
    const propertyDocument = [];
    if (query.Media) {
      for (const x of query.Media as any) {
        if (x.MediaCategory == 'Photo') {
          images.push({
            url: x.MediaURL,
            thumbNail: x.Thumbnail,
          });
        } else if (
          [
            'text/plain',
            'text/csv',
            'application/rtf',
            'application/pdf',
            'text/html',
            'application/msword',
            'application/vnd.ms-excel',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument',
          ].includes(x.MimeType)
        ) {
          propertyDocument.push({
            url: x.MediaURL,
            thumbNail: x.Thumbnail,
          });
        }
      }
    }
    const property = {
      propertyAddressDetails: {
        formattedAddress: query.UnparsedAddress,
        streetNumber: query.StreetNumberNumeric,
        streetName: query.StreetName,
        city: query.City,
        state: query.StateOrProvince,
        province: query.StateOrProvince,
        postalCode: query.PostalCode,
        country: query.Country,
      },
      images: images,
      propertyDocument,
      propertyName: query.UnparsedAddress,
      longitude: query.Longitude,
      latitude: query.Latitude,
      lotSizeValue:
        query.LotSizeAcres || query.LotSizeSquareFeet || query.LotSizeArea,
      lotSizeUnit: query.LotSizeDimensions,
      numBathroom: query.BathroomsTotalInteger,
      numBedroom: query.BedroomsTotal,
      price: { amount: query.ListPrice, currency: 'USD' },
      propertyType: query.PropertyType,
      yearBuild: query.YearBuilt,
      propertyDescription: query.PublicRemarks,
      closeSchoolDetails: {
        distanceToSchoolBusNumeric: query.DistanceToSchoolBusNumeric,
        elementarySchoolDistrict: query.ElementarySchoolDistrict,
        middleOrJuniorSchoolDistrict: query.MiddleOrJuniorSchoolDistrict,
        highSchool: query.HighSchool,
        elementarySchool: query.ElementarySchool,
        highSchoolDistrict: query.HighSchoolDistrict,
        middleOrJuniorSchool: query.MiddleOrJuniorSchool,
      },
    };

    return property;
  }
}
