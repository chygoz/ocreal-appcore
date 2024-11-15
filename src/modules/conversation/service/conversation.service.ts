import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from '../schema/conversation.schema';
import { CreateConversationDto } from '../dto/conversatin.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  async Create(payload: CreateConversationDto) {
    try {
      const existingConversation = await this.conversationModel.findOne({
        'members.userId': payload.members.sellerId,
        'members.agentId': payload.members.sellerAgentId,
      });

      if (existingConversation) {
        return existingConversation;
      }

      // Create a new conversation if none exists
      const newConversation = this.conversationModel.create({
        members: payload.members,
      });

      return newConversation;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async getConversationsByMember(memberId: string): Promise<Conversation[]> {
    try {
      return await this.conversationModel.find({
        $or: [{ 'members.userId': memberId }, { 'members.agentId': memberId }],
      });
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async getOneConversation(conversationId: string): Promise<Conversation> {
    try {
      const conversation =
        await this.conversationModel.findById(conversationId);
      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }
      return conversation;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
