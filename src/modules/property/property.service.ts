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
  CreatePropertyDto,
  UpdatePropertyDto,
} from './dto/property.dto';
import { AccountTypeEnum } from 'src/constants';
import { Agent } from '../agent/schema/agent.schema';
import { PaginationDto } from 'src/constants/pagination.dto';
import { PropertyTour } from './schema/propertyTour.schema';
import { CreateTourDto } from './dto/tour.dto';
import { CreateOfferDto } from './dto/offer.dto';
import { configs } from 'src/configs';
import axios, { AxiosInstance } from 'axios';
import { Offer } from './schema/offer.schema';
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
  async createPropertyOffer(
    data: CreateOfferDto,
    agent: Agent,
  ): Promise<Offer> {
    const property = await this.propertyModel
      .findById(data.property)
      .populate('buyer')
      .exec();
    if (
      property.currentStatus != PropertyStatusEnum.pending &&
      property.currentStatus !== PropertyStatusEnum.sold
    ) {
      throw new BadRequestException(
        'You can not make an offer for this property at this time.',
      );
    }

    const newData = {
      ...data,
      seller: property?.seller,
      sellerAgent: agent,
      buyer: property.buyer,
      buyerAgent: property.buyerAgent,
    };
    const createdProperty = new this.offerModel(newData);
    const result = createdProperty.save();
    console.log(result);
    return result;
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
    const currentDate = new Date();
    if (data.tourDate < currentDate) {
      throw new BadRequestException('You can not book a date in the past');
    }
    const tourPayload = {
      ...data,
      buyer: user,
      seller: property.seller,
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
        .find({ agent: agent._id })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyTourModel.countDocuments({ agent: agent._id }),
    ]);
    if (result.length === 0) {
      throw new BadRequestException('No tour found');
    }
    return { result, total, page, limit };
  }

  async updateProperty(
    data: UpdatePropertyDto,
    user: User,
    id: string,
  ): Promise<Property> {
    const property = await this.propertyModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      seller: user.id,
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const updatedProperty = await this.propertyModel.findByIdAndUpdate(
      property._id,
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
    const alreadyInvited = await this.agentPropertyInviteModel.find({
      invitedBy: user.id,
      property: data.propertyId,
      agent: data.agentId,
    });
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
    const agent = await this.agentModel.findById(data.agentId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const newPropertyInvite = {
      inviteAccountType: user_role,
      invitedBy: user,
      property: property,
      agent: Agent,
    };

    const propertyAgentinvite =
      await this.agentPropertyInviteModel.create(newPropertyInvite);
    //TODO: send notifications at this point
    return propertyAgentinvite.save();
  }

  async getUserProperties(paginationDto: PaginationDto, user: User) {
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
          $or: [
            { seller: user._id.toString() },
            { buyer: user._id.toString() },
          ],
          ...query,
        }
      : {
          $or: [
            { seller: user._id.toString() },
            { buyer: user._id.toString() },
          ],
        };

    const queryParam: any = {
      $or: [
        {
          buyer: user._id,
        },
        {
          seller: user._id,
        },
      ],
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
    const invite = await this.agentPropertyInviteModel.findOne({
      _id: new Types.ObjectId(dto.inviteId),
      agent: agent.id,
      currentStatus: AgentPropertyInviteStatusEnum.pending,
    });

    if (!invite) {
      throw new NotFoundException('invite not found');
    }

    const property = await this.propertyModel.findById(invite.property);
    const update: any = {};
    let user;
    if (dto.response == 'accepted') {
      if (invite?.inviteAccountType === AccountTypeEnum.SELLER) {
        property.status.push({
          status: PropertyStatusEnum.sellerAgentAcceptedInvite,
          eventTime: new Date(),
        });
        update.sellerAgent = agent;
        update.status = property.status;
        user = property.seller;
      } else if (invite?.inviteAccountType === AccountTypeEnum.BUYER) {
        update.buyerAgent = agent;
        property.status.push({
          status: PropertyStatusEnum.buyerAgentAcceptedInvite,
          eventTime: new Date(),
        });
        update.status = property.status;
        user = property.buyer;
      }
      await this.propertyModel.findByIdAndUpdate(
        property._id,
        { ...update },
        { new: true },
      );
      const updatedInvite = await this.agentPropertyInviteModel.findById(
        dto.inviteId,
        {
          currentStatus: AgentPropertyInviteStatusEnum.accepted,
        },
      );
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
      return updatedInvite;
    } else if (dto.response == 'rejected') {
      if (invite?.inviteAccountType === AccountTypeEnum.SELLER) {
        user = property.seller;
      } else if (invite?.inviteAccountType === AccountTypeEnum.BUYER) {
        user = property.buyer;
      }
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
      const updatedInvite = await this.agentPropertyInviteModel.findById(
        dto.inviteId,
        {
          currentStatus: AgentPropertyInviteStatusEnum.rejected,
        },
      );
      return updatedInvite;
    }
  }

  async getSingleProperty(id: string): Promise<Property> {
    const property = await this.propertyModel
      .findById(id)
      .populate('brokers.agent')
      .populate('sellerAgent', 'firstname lastname')
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
    const queryObject = search ? { ...query } : {};

    const [result, total] = await Promise.all([
      this.propertyModel
        .find(queryObject)
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
    query.Media.forEach((x) => {
      if (
        [
          'image/jpeg',
          'image/png',
          'image/gif',
          ' image/bmp',
          'image/tiff',
        ].includes(x.MimeType)
      )
        images.push({
          url: x.MediaURL,
        });
      if (
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
        });
      }
    });
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
    };

    return property;
  }
}
