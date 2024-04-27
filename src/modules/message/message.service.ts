import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from './schema/chat.schema';
import { Message } from './schema/message.schema';
import { PaginationDto } from 'src/constants/pagination.dto';
import { MessageGateway } from '../socket/message.gateway';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageRepo: Model<Message>,
    @InjectModel(Chat.name) private readonly chatRepo: Model<Chat>,
    private readonly messageGateway: MessageGateway,
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
    this.messageGateway.server.emit('message', result);
    return result;
  }

  async createChat(chat: Partial<Chat>): Promise<Chat> {
    const message = await this.messageRepo.findById(chat.message).lean();
    if (!message) {
      throw new BadRequestException('A new chat must have a valid message Id');
    }
    const chatModel = await this.chatRepo.create(chat);
    const newChat = await chatModel.save();
    message.chats.push(newChat);
    return await this.messageRepo
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
