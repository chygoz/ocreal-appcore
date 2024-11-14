import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OpenMessage } from './schema/openmessage.schema';
import { OpenConversation } from '../conversation/schema/openConversaion.schema';
// Assuming you have this service for handling conversation logic

@Injectable()
export class OpenMessageService {
  constructor(
    @InjectModel(OpenMessage.name)
    private readonly openMessageModel: Model<OpenMessage>,
    @InjectModel(OpenConversation.name)
    private readonly openConversationModel: Model<OpenConversation>,
  ) {}

  // Add a message to a conversation
  async addMessageToConversation(
    conversationId: string,
    senderId: Types.ObjectId,
    messageContent: string,
    attachmentUrl?: string,
  ) {
    const conversation =
      await this.openConversationModel.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = new this.openMessageModel({
      conversationId: conversation._id,
      senderId,
      message: messageContent,
      attachmentUrl,
    });

    await message.save();
    return message;
  }

  // Get all messages from a conversation
  async getMessagesFromConversation(conversationId: string) {
    const conversation =
      await this.openConversationModel.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    return this.openMessageModel.find({ conversationId }).exec();
  }
}
