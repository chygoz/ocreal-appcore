import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User } from '../users/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { EmailService } from 'src/services/email/email.service';
import { Property, PropertyStatusEnum } from './schema/property.schema';
// import { configs } from 'src/configs';
import { PropertyQuery } from './schema/propertyQuery.schema';
import {
  AddAgentToPropertyDto,
  AgentAcceptInviteDto,
  AgentCreatePropertyDto,
  CreatePropertyDto,
  UpdatePropertyDto,
} from './dto/property.dto';
import { AccountTypeEnum } from 'src/constants';
import { Agent } from '../agent/schema/agent.schema';
import { PaginationDto } from 'src/constants/pagination.dto';
import { PropertyTour } from './schema/propertyTour.schema';
import { CreateTourDto } from './dto/tour.dto';
import {
  CreateAgentPropertyOfferDto,
  CreateUserOfferDto,
} from './dto/offer.dto';
import { configs } from 'src/configs';
import axios, { AxiosInstance } from 'axios';
import {
  Offer,
  OfferCreatorTypeEnum,
  OfferStatusEnum,
} from './schema/offer.schema';
import {
  AgentPropertyInvite,
  AgentPropertyInviteStatusEnum,
} from './schema/agentPropertyInvite.schema';
import { UserSavedProperty } from './schema/userFavoriteProperties.schema';

@Injectable()
export class PropertyService {
  private readonly axiosInstance: AxiosInstance;
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
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
    private readonly emailService: EmailService,
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

  async createProperty(data: CreatePropertyDto, user: User): Promise<Property> {
    const newData = {
      propertyName: data.propertyAddressDetails.formattedAddress,
      seller: user.id,
      propertyAddressDetails: data.propertyAddressDetails,
    };
    const createdProperty = new this.propertyModel(newData);
    const result = createdProperty.save();
    return result;
  }

  async agentCreateProperty(
    data: AgentCreatePropertyDto,
    user: Agent,
  ): Promise<Property> {
    const newData = {
      propertyName: data.propertyAddressDetails.formattedAddress,
      sellerAgent: user.id,
      propertyAddressDetails: data.propertyAddressDetails,
    };
    const createdProperty = new this.propertyModel(newData);
    const result = createdProperty.save();
    return result;
  }

  async createUserPropertyOffer(
    data: CreateUserOfferDto,
    user: User,
  ): Promise<Offer> {
    const offerCreated = await this.offerModel.find({
      $or: [
        { property: data.property, buyer: user },
        { property: data.property, buyerAgent: data.buyerAgent },
      ],
    });
    if (offerCreated.length > 0) {
      throw new BadRequestException(
        'An offer has already been created for this property',
      );
    }
    const property = await this.propertyModel
      .findById(data.property)
      .populate(['buyer', 'seller', 'sellerAgent'])
      .exec();
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const canCreateOffer = [
      PropertyStatusEnum.pending,
      PropertyStatusEnum.nowShowing,
    ].includes(property.currentStatus as PropertyStatusEnum);
    if (!canCreateOffer) {
      throw new BadRequestException(
        'You can not make an offer for this property at this time.',
      );
    }
    if (data.submitWithOutAgentApproval && !data.buyerAgent) {
      throw new BadRequestException(
        'Please add a property agent before completing this action',
      );
    }
    const newData = {
      ...data,
      // seller: property?.seller,
      // sellerAgent: property.sellerAgent,
      buyer: user,
      buyerAgent: new Types.ObjectId(data.buyerAgent),
      offerCreator: OfferCreatorTypeEnum.buyer,
    };
    const createdProperty = new this.offerModel(newData);
    const result = createdProperty.save();

    //TODO: Notify all perties at this point
    console.log(result);
    return result;
  }

  async createAgentPropertyOffer(
    data: CreateAgentPropertyOfferDto,
    agent: Agent,
  ): Promise<Offer> {
    const offerCreated = await this.offerModel.find({
      $or: [
        { property: data.property, buyerAgent: agent },
        { property: data.property, buy: data.buyer },
      ],
    });
    if (offerCreated.length > 0) {
      throw new BadRequestException(
        'An offer has already been created fo rthis property',
      );
    }
    const property = await this.propertyModel
      .findById(data.property)
      .populate(['buyer', 'seller', 'sellerAgent'])
      .exec();
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    if (property.currentStatus !== PropertyStatusEnum.pending) {
      throw new BadRequestException(
        'You can not make an offer for this property at this time.',
      );
    }
    const canCreateOffer = [
      PropertyStatusEnum.pending,
      PropertyStatusEnum.nowShowing,
    ].includes(property.currentStatus as PropertyStatusEnum);
    if (!canCreateOffer) {
      console.log(canCreateOffer, property.currentStatus);
      throw new BadRequestException(
        'You can not make an offer for this property at this time.',
      );
    }

    const newData = {
      ...data,
      // seller: property?.seller,
      // sellerAgent: property.sellerAgent,
      buyer: new Types.ObjectId(data.buyer),
      buyerAgent: agent,
      offerCreator: OfferCreatorTypeEnum.agent,
    };
    const createdProperty = new this.offerModel(newData);
    const result = await createdProperty.save();

    //TODO: Notify all perties at this point
    console.log(result);
    return result;
  }

  async agentSubmitPropertyOffer(agent: Agent, id: string): Promise<Offer> {
    const offer = await this.offerModel.findOne({
      _id: new Types.ObjectId(id),
      buyerAgent: agent,
      submitWithOutAgentApproval: { $ne: true },
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.agentApproval) {
      throw new BadRequestException('Offer already submitted');
    }
    if (offer.currentStatus !== OfferStatusEnum.pending) {
      throw new BadRequestException('You can not subtmit this offer');
    }
    const property = await this.propertyModel
      .findById(offer.property)
      .populate(['buyer', 'seller', 'sellerAgent'])
      .exec();
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const canCreateOffer = [
      PropertyStatusEnum.pending,
      PropertyStatusEnum.nowShowing,
    ].includes(property.currentStatus as PropertyStatusEnum);
    if (!canCreateOffer) {
      console.log(canCreateOffer, property.currentStatus);
      throw new BadRequestException(
        'You can not make an offer for this property at this time.',
      );
    }
    const update = await this.offerModel.findByIdAndUpdate(
      offer.id,
      {
        seller: property?.seller,
        sellerAgent: property.sellerAgent,
        agentApproval: true,
        agentApprovalDate: new Date().toUTCString(),
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
    );
    //TODO: Notify all perties at this point
    return update;
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
    encodedParams.set('app_client_id', configs.MLS_CLIENT_ID);
    const config = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-api-key': configs.MLS_API_AUTH_KEY,
        'X-RapidAPI-Key': configs.MLS_RAPID_API_KEY,
        'X-RapidAPI-Host': 'mls-router1.p.rapidapi.com',
      },
    };

    const propertResponse = await this.axiosInstance.post(
      'https://mls-router1.p.rapidapi.com/cognito-oauth2/token',
      encodedParams,
      config,
    );
    const access_token = propertResponse.data.access_token;
    try {
      const propertyResponse = await this.axiosInstance.get(
        `https://mls-router1.p.rapidapi.com/reso/odata/Property?UnparsedAddress eq "${UnparsedAddress}"&top=10`,
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'x-api-key': configs.MLS_X_API_REQUEST_KEY,
            'X-RapidAPI-Key': configs.MLS__RAPID_API_REQUEST_KEY,
            'X-RapidAPI-Host': configs.MLS__RAPID_API_REQUEST_HOST,
            Authorization: access_token,
          },
        },
      );
      const properties = propertyResponse.data.value;
      if (properties.length > 0) {
        await this.propertyQueryModel.insertMany(properties);
      }
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
    const property = await this.propertyModel.findById(data.property);
    if (!property) throw new NotFoundException('Property not found');
    if (property.currentStatus !== PropertyStatusEnum.nowShowing) {
      throw new BadRequestException(
        'You can no longer tour this property as it currently under contract',
      );
    }
    const currentDate = new Date();
    if (data.tourDate < currentDate) {
      throw new BadRequestException('You can not book a date in the past');
    }
    const tourPayload = {
      ...data,
      buyer: user,
      seller: property?.seller,
      sellerAgent: property.sellerAgent,
    };
    const propertyTour = new this.propertyTourModel(tourPayload);
    const savedTour = propertyTour.save();
    //TODO: send notifications to the seller and seller Agent here as also the buyer and BuyerAgent

    return savedTour;
  }

  async saveUserProperty(propertyId: string, user: User) {
    const property = await this.propertyModel.findById(propertyId);
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
        .sort({ createdAt: -1 })
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
        .sort({ createdAt: -1 })
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
    const property = await this.propertyModel.findById(data.propertyId);
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

    const queryData = search
      ? {
          buyer: user._id.toString(),
          ...query,
        }
      : {
          buyer: user._id.toString(),
        };

    const queryParam: any = {
      buyer: user._id,
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
      this.propertyModel.find(queryParam).skip(skip).limit(limit).exec(),
      this.propertyModel.countDocuments(queryParam),
    ]);
    if (result.length === 0) {
      throw new BadRequestException('No property found');
    }
    return { result, total, page, limit };
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
      this.propertyModel.find(queryParam).skip(skip).limit(limit).exec(),
      this.propertyModel.countDocuments(queryParam),
    ]);
    if (result.length === 0) {
      throw new BadRequestException('No property found');
    }
    return { result, total, page, limit };
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

    return { result, total, page, limit };
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
        .exec(),
      this.propertyModel.countDocuments(queryParam),
    ]);

    return { result, total, page, limit };
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

  async getUserTours(paginationDto: PaginationDto, user: User) {
    const { page = 1, limit = 10 } = paginationDto;

    const skip = (page - 1) * limit;

    const query: any = {
      $or: [
        {
          buyer: user._id,
        },
        {
          seller: user._id,
        },
      ],
    };

    const [tours, total] = await Promise.all([
      this.propertyTourModel
        .find(query)
        .sort({ tourDate: 1 })
        .populate('property')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyTourModel.countDocuments({
        $or: [
          {
            buyer: user._id,
          },
          {
            seller: user._id,
          },
        ],
      }),
    ]);
    if (tours.length === 0) {
      throw new BadRequestException('No tour found');
    }
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
      await this.propertyModel.findByIdAndUpdate(
        property._id,
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
      return updatedInvite;
    }
  }

  async publishProperty(agent: Agent, id: string) {
    const property = await this.propertyModel.findOne({
      _id: new Types.ObjectId(id),
      sellerAgent: agent.id,
      currentStatus: PropertyStatusEnum.pending,
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

    //TODO: Notify the seller that the property has been published
    return update;
  }

  async getSingleProperty(id: string): Promise<Property> {
    const property = await this.propertyModel
      .findById(id)
      .populate('brokers.agent')
      .populate('sellerAgent', 'firstname lastname avatar')
      .populate('buyerAgent', 'firstname lastname avatar')
      .exec();

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
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
      this.propertyModel.countDocuments(query),
    ]);
    if (result.length === 0) {
      throw new BadRequestException('No properties at the moment');
    }
    return { result, total, page, limit };
  }

  async getAgentMostRecentTour(agent: Agent) {
    const tour = await this.propertyTourModel
      .findOne({
        sellerAgent: agent.id,
      })
      .sort({ createdAt: -1 })
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
  //     const days = calculateDaysBetweenDates(query.createdAt, new Date());
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
    console.log(query);
    for (const x of query.Media as any) {
      if (x.MediaCategory == 'Photo') {
        images.push({
          url: x.MediaURL,
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
    console.log(images, propertyDocument);
    // query.Media.forEach((x) => {
    //   if (
    //     [
    //       'image/jpeg',
    //       'image/png',
    //       'image/gif',
    //       ' image/bmp',
    //       'image/tiff',
    //     ].includes(x.MimeType)
    //   )
    //     images.push({
    //       url: x.MediaURL,
    //     });
    //   if (
    //     [
    //       'text/plain',
    //       'text/csv',
    //       'application/rtf',
    //       'application/pdf',
    //       'text/html',
    //       'application/msword',
    //       'application/vnd.ms-excel',
    //       'application/vnd.ms-powerpoint',
    //       'application/vnd.openxmlformats-officedocument',
    //     ].includes(x.MimeType)
    //   ) {
    //     propertyDocument.push({
    //       url: x.MediaURL,
    //     });
    //   }
    // });
    const property = {
      propertyAddressDetails: {
        formattedAddress: query.UnparsedAddress,
        streetNumber: query.StreetNumber,
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
      lotSizeValue: query.LotSizeAcres,
      lotSizeUnit: query.LotSizeUnits,
      numBathroom: query.BathroomsTotalInteger,
      numBedroom: query.BedroomsTotal,
      price: { amount: query.ListPrice, currency: 'USD' },
      propertyType: query.PropertyType,
      yearBuild: query.YearBuilt,
      propertyDescription: query.PublicRemarks,
    };

    return property;
  }
}
