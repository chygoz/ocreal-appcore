import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OpenConversation } from '../schema/openConversaion.schema';
import { OpenConversationDto } from '../dto/conversatin.dto';

@Injectable()
export class OpenConversationService {
  constructor(
    @InjectModel(OpenConversation.name)
    private readonly openConversationModel: Model<OpenConversation>,
  ) {}

  async createConversation(payload: OpenConversationDto) {
    const { propertyId, agentId, userId } = payload;
    const members = [agentId, userId];
    const membersType = ['Agent', 'User'];

    const conversation = new this.openConversationModel({
      propertyId,
      members,
      membersType,
    });

    return await conversation.save();
  }

  async getConversationByProperty(propertyId: string) {
    return await this.openConversationModel.find({ propertyId }).exec();
  }

  async getConversationByMember(memberId: string) {
    return await this.openConversationModel.find({ members: memberId }).exec();
  }

  async addMemberToConversation(
    conversationId: string,
    memberId: Types.ObjectId,
    memberType: 'Agent' | 'User',
  ) {
    // Find the conversation by ID
    const conversation =
      await this.openConversationModel.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    // Ensure members and membersType are initialized arrays
    if (
      !Array.isArray(conversation.members) ||
      !Array.isArray(conversation.membersType)
    ) {
      throw new Error('Conversation members data is corrupted');
    }

    // Check if the member is already in the conversation
    const isMemberAlreadyAdded = conversation.members.some(
      (id, index) =>
        id &&
        id.equals(memberId) &&
        conversation.membersType[index] === memberType,
    );

    if (isMemberAlreadyAdded) {
      throw new Error('Member is already part of the conversation');
    }

    // Add the member
    conversation.members.push(memberId);
    conversation.membersType.push(memberType);
    await conversation.save();

    return conversation;
  }
}

//
