import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Conversation } from '../schema/conversation.schema';
import { CreateConversationDto } from '../dto/conversatin.dto';
import { Property } from 'src/modules/property/schema/property.schema';
import { AgentPropertyInvite } from 'src/modules/property/schema/agentPropertyInvite.schema';
import { User } from 'src/modules/users/schema/user.schema';
import { Offer } from 'src/modules/property/schema/offer.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Property.name)
    private readonly propertyModel: Model<Property>,
    @InjectModel(Offer.name)
    private readonly OfferModel: Model<Offer>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(AgentPropertyInvite.name)
    private readonly agentModel: Model<AgentPropertyInvite>,
  ) {}

  isValidObjectId(value: any): boolean {
    return mongoose.Types.ObjectId.isValid(value);
  }

  async Create(payload: CreateConversationDto) {
    try {
      const { propertyId, buyerAgent } = payload;

      // Check if the conversation already exists
      const existingConversation = await this.conversationModel.findOne({
        propertyId,
        buyerAgent,
      });

      if (existingConversation) {
        return existingConversation; // Return existing conversation if found
      }

      // Step 2: If no existing conversation, check for an agent invite

      const offer = await this.OfferModel.findOne({
        property: propertyId,
        buyerAgent: buyerAgent,
      });

      if (!offer)
        throw new NotFoundException('An offer has not been submitted');

      // If an agent invite exists, create a new conversation with sellerAgent
      const newConversation = await this.conversationModel.create({
        propertyId,
        sellerAgent: offer.sellerAgent,
        seller: offer.seller,
        buyerAgent: offer.buyerAgent || null,
        buyer: offer.buyer || null,
      });

      return newConversation;
    } catch (error) {
      console.log('THE ERROR', error);
      throw new BadRequestException(error.message); // Consider using BadRequestException for input validation errors
    }
  }

  async getConversationsByMember(id: string) {
    try {
      const conversations = await this.conversationModel
        .find({
          $or: [
            { buyer: id },
            { seller: id },
            { sellerAgent: id },
            { buyerAgent: id },
          ],
        })
        .populate('propertyId')
        .populate('sellerAgent', 'fullname')
        .populate('buyerAgent', 'fullname')
        .exec();

      return conversations;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async getOneConversation(conversationId: string): Promise<Conversation> {
    try {
      const conversation = await this.conversationModel
        .findById(conversationId)
        //.populate('propertyId')
        .populate('seller')
        .populate('sellerAgent')
        .populate('buyer')
        .populate('buyerAgent')
        .exec();
      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }
      return conversation;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async getAllConversationsByAgentAndPropertyId(
    id: string,
    propertyId: string,
  ) {
    try {
      const conversations = await this.conversationModel
        .find({
          $and: [
            {
              $or: [{ sellerAgent: id }, { buyerAgent: id }],
            },
            { propertyId: propertyId },
          ],
        })
        .populate('propertyId')
        .populate('seller', 'fullname')
        .populate('sellerAgent', 'fullname')
        .populate('buyer', 'fullname')
        .populate('buyerAgent', 'fullname')
        .exec();

      if (!conversations || conversations.length === 0) {
        throw new NotFoundException('No conversations found');
      }

      return conversations;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
