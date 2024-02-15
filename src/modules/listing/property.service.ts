import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User } from '../users/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { EmailService } from 'src/services/email/email.service';
import { Property, PropertyStatusEnum } from './schema/property.schema';
// import { configs } from 'src/configs';
import { PropertyQuery } from './schema/propertyQuery.schema';
import {
  AddAgentToPropertyDto,
  CreatePropertyDto,
  UpdatePropertyDto,
} from './dto/property.dto';
import { AccountTypeEnum } from 'src/constants';
import { Agent } from '../agent/schema/agent.schema';
import { PaginationDto } from 'src/constants/pagination.dto';
// import { calculateDaysBetweenDates } from 'src/utils/data.utils';

@Injectable()
export class PropertyService {
  // private readonly axiosInstance: AxiosInstance;
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel(Agent.name) private agentModel: Model<Agent>,
    @InjectModel(PropertyQuery.name)
    private propertyQueryModel: Model<PropertyQuery>,
    private readonly emailService: EmailService,
    // private readonly axiosInstance: AxiosInstance,
  ) {
    // this.axiosInstance = axios.create({
    //   baseURL: 'https://api.datafiniti.co/v4/',
    //   timeout: 5000,
    //   headers: {
    //     Authorization: 'Bearer ' + configs.DATA_INFINITI_API_KEY,
    //     'Content-Type': 'application/json',
    //   },
    // });
  }

  async createProperty(data: CreatePropertyDto, user: User): Promise<Property> {
    const newData = {
      propertyName: data.propertyAddressDetails.formattedAddress,
      seller: user.id,
    };
    const createdProperty = new this.propertyModel(newData);
    return createdProperty.save();
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
    user_role: AccountTypeEnum,
    data: AddAgentToPropertyDto,
  ): Promise<Property> {
    const property = await this.propertyModel.findById(data.propertyId);
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const agent = await this.agentModel.findById(data.agentId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    const update: any = {};
    if (user_role === AccountTypeEnum.SELLER) {
      update.sellerAgent = agent;
      property.status.push({
        status: PropertyStatusEnum.sellerAgentAdded,
        eventTime: new Date(),
      });
      update.status = property.status;
    } else if (user_role === AccountTypeEnum.BUYER) {
      update.buyerAgent = agent;
      property.status.push({
        status: PropertyStatusEnum.buyerAgentAdded,
        eventTime: new Date(),
      });
      update.status = property.status;
    }
    const updatedProperty = await this.propertyModel.findByIdAndUpdate(
      property._id,
      { ...update },
      { new: true },
    );
    return updatedProperty;
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

    const [properties, total] = await Promise.all([
      this.propertyModel
        .find(queryObject)
        .skip(skip)
        .limit(limit)
        .populate('sellerAgent', 'firstname lastname')
        .exec(),
      this.propertyModel.countDocuments(query),
    ]);
    if (properties.length === 0) {
      throw new BadRequestException('No properties at the moment');
    }
    return { properties, total, page, limit };
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
}
