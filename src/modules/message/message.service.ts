import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from './schema/chat.schema';
import { Message, MessageTypeEnum } from './schema/message.schema';
import { PaginationDto } from 'src/constants/pagination.dto';
import NotificationService from '../notification/notitifcation.service';
import {
  AgentPropertyInvite,
  AgentPropertyInviteStatusEnum,
} from '../property/schema/agentPropertyInvite.schema';
import { User } from '../users/schema/user.schema';
import { Agent } from '../agent/schema/agent.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageRepo: Model<Message>,
    @InjectModel(Chat.name) private readonly chatRepo: Model<Chat>,
    @InjectModel(AgentPropertyInvite.name)
    private readonly agentPropertyInviteRepo: Model<AgentPropertyInvite>,
    private readonly notificationService: NotificationService,
  ) {}

  async createMessage(message: Partial<Message>): Promise<Message> {
    const foundMessage = await this.messageRepo
      .findOne({
        property: message.property,
      })
      .populate(['chats', 'chats.sender'])
      .populate('user')
      .populate('agent');
    if (foundMessage) {
      return foundMessage;
    }
    const messageModel = await this.messageRepo.create(message);
    const savedMessage = await messageModel.save();

    const result = await this.messageRepo
      .findById(savedMessage._id)
      .populate(['chats', 'chats.sender'])
      .populate('user')
      .populate('agent');

    return result;
  }

  async createChat(chat: Partial<Chat>) {
    const message = await this.messageRepo.findById(chat.message).lean();
    if (!message) {
      throw new BadRequestException('A new chat must have a valid message Id');
    }
    const chatModel = await this.chatRepo.create(chat);
    const newChat = await chatModel.save();
    message.chats.push(newChat);
    const updatedMessage = await this.messageRepo
      .findByIdAndUpdate(
        message._id,
        {
          $push: {
            chats: newChat._id,
          },
        },
        {
          new: true,
        },
      )
      .populate([
        { path: 'chats', populate: { path: 'sender' } },
        'user',
        'agent',
      ]);
    if (message.messageType == MessageTypeEnum.agentToAgent) {
      await this.notificationService.sendPushNotification(
        'You have a new chat message',
        [
          chat.sender != message.buyerAgent
            ? (message.buyerAgent as any)
            : (message.sellerAgent as any),
        ],
      );
    } else {
      await this.notificationService.sendPushNotification(
        'You have a new chat message',
        [
          chat.sender != message.buyerAgent
            ? (message.buyerAgent as any)
            : (message.sellerAgent as any),
        ],
      );
    }
    return updatedMessage;
  }

  async findChatById(id: string): Promise<Message[]> {
    return await this.chatRepo.findById(id).lean();
  }

  async findMessageChats(id: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [chats, total] = await Promise.all([
      this.chatRepo
        .find({ message: new Types.ObjectId(id) })
        .populate('sender')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.chatRepo.countDocuments({ message: new Types.ObjectId(id) }),
    ]);
    if (chats.length === 0) {
      throw new BadRequestException('No Chats found');
    }
    return {
      chats,
      total,
      page,
      limit,
    };
  }

  async getUserMessageByPropertyAndAgent(
    { agentId, propertyId },
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const message = await this.messageRepo.findOne({
      $or: [
        {
          property: new Types.ObjectId(propertyId),
          agent: new Types.ObjectId(agentId),
        },
        // {
        //   property: new Types.ObjectId(propertyId),
        //   buyer: new Types.ObjectId(userId),
        // },
      ],
    });
    if (!message) {
      throw new BadRequestException('Message not found');
    }
    const [chats, total] = await Promise.all([
      this.chatRepo
        .find({ message: message._id })
        .populate('sender')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.chatRepo.countDocuments({ message: message._id }),
    ]);
    return {
      chats,
      total,
      page,
      limit,
    };
  }

  async getAgentMessageByPropertyAndUser(
    { userId, propertyId },
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const message = await this.messageRepo.findOne({
      $or: [
        {
          property: new Types.ObjectId(propertyId),
          user: new Types.ObjectId(userId),
        },
        // {
        //   property: new Types.ObjectId(propertyId),
        //   buyer: new Types.ObjectId(userId),
        // },
      ],
    });
    if (!message) {
      throw new BadRequestException('Message not found');
    }
    const [chats, total] = await Promise.all([
      this.chatRepo
        .find({ message: message._id })
        .populate('sender')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.chatRepo.countDocuments({ message: message._id }),
    ]);
    return {
      chats,
      total,
      page,
      limit,
    };
  }

  async getUserConnectedAgentsMessages(
    paginationDto: PaginationDto,
    user: User,
  ) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;
    const searchStage = {
      $match: {},
    };

    if (search) {
      searchStage.$match = {
        $or: [
          {
            'properties.numBathroom': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'properties.lotSizeUnit': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'properties.propertyAddressDetails.formattedAddress': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'agent.licence_number': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'agent.firstname': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'agent.lastname': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'agent.region': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'agent.email': new RegExp(new RegExp(search, 'i'), 'i'),
          },
        ],
      };
    }
    const pipeline = [
      {
        $match: {
          currentStatus: {
            $nin: [
              AgentPropertyInviteStatusEnum.pending,
              AgentPropertyInviteStatusEnum.rejected,
            ],
          },
          invitedBy: user._id,
        },
      },
      {
        $group: {
          _id: '$agent',
          uniqueProperties: { $addToSet: '$property' },
        },
      },
      {
        $project: {
          _id: 1,
          propertyCount: { $size: '$uniqueProperties' },
          properties: '$uniqueProperties',
        },
      },
      {
        $lookup: {
          from: 'agents',
          localField: '_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      {
        $unwind: '$agent',
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'properties',
          foreignField: '_id',
          as: 'properties',
        },
      },
      searchStage,
      {
        $project: {
          _id: 1,
          propertyCount: 1,
          properties: 1,
          agent: {
            _id: 1,
            licence_number: 1,
            firstname: 1,
            lastname: 1,
            fullname: 1,
          },
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ];
    const result = await this.agentPropertyInviteRepo.aggregate(pipeline);
    const connections = result[0]?.data ?? [];
    const total = result[0]?.totalCount ?? 0;

    return {
      connections,
      total,
      page,
      limit,
    };
  }

  async getAgentConnectedUserMessages(
    paginationDto: PaginationDto,
    user: Agent,
  ) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;
    const searchStage = {
      $match: {},
    };
    console.log(user, '  << AGENT');
    if (search) {
      searchStage.$match = {
        $or: [
          {
            'properties.numBathroom': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'properties.lotSizeUnit': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'properties.propertyAddressDetails.formattedAddress': new RegExp(
              new RegExp(search, 'i'),
              'i',
            ),
          },
          {
            'user.fullname': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'user.firstname': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'user.lastname': new RegExp(new RegExp(search, 'i'), 'i'),
          },
          {
            'user.email': new RegExp(new RegExp(search, 'i'), 'i'),
          },
        ],
      };
    }
    const pipeline = [
      {
        $match: {
          $or: [
            {
              agent: user._id,
              // currentStatus: {
              //   $nin: [
              //     AgentPropertyInviteStatusEnum.pending,
              //     AgentPropertyInviteStatusEnum.rejected,
              //   ],
              // },
            },
            {
              email: user.email,
              // currentStatus: {
              //   $nin: [
              //     AgentPropertyInviteStatusEnum.pending,
              //     AgentPropertyInviteStatusEnum.rejected,
              //   ],
              // },
            },
          ],
        },
      },
      {
        $group: {
          _id: '$invitedBy',
          uniqueProperties: { $addToSet: '$property' },
        },
      },
      {
        $project: {
          _id: 1,
          propertyCount: { $size: '$uniqueProperties' },
          properties: '$uniqueProperties',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: 'properties',
          localField: 'properties',
          foreignField: '_id',
          as: 'properties',
        },
      },
      searchStage,
      {
        $project: {
          _id: 1,
          propertyCount: 1,
          properties: 1,
          user: {
            _id: 1,
            fullname: 1,
            firstname: 1,
            lastname: 1,
          },
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ];
    const result = await this.agentPropertyInviteRepo.aggregate(pipeline);
    const connections = result[0]?.data ?? [];
    const total = result[0]?.totalCount ?? 0;

    return {
      connections,
      total,
      page,
      limit,
    };
  }

  async findUserMessages(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.messageRepo
        .find({ user: new Types.ObjectId(userId) })
        .populate(['chats', 'chats.sender'])
        .populate('agent')
        .populate('user')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageRepo.countDocuments({ user: userId }),
    ]);
    if (messages.length === 0) {
      throw new BadRequestException('No messages found');
    }
    return {
      messages,
      total,
      page,
      limit,
    };
  }
}
