import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from '../conversation/schema/conversation.schema';
import { CreateMessageDto } from './dto/createMessage.dto';
import { Message } from './schema/message.schema';
import { format } from 'date-fns';
import { AwsS3Service } from '../uploader/aws';
//import { OpenConversation } from '../conversation/schema/openConversaion.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  // Function to create a new message
  async createMessage(payload: CreateMessageDto) {
    try {
      // Validate if the conversation exists
      const conversation = await this.conversationModel.findById(
        payload.conversationId,
      );
      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      const checkSender = await this.conversationModel.findOne({
        _id: payload.conversationId,
        $or: [
          { buyer: payload.senderId },
          { seller: payload.senderId },
          { sellerAgent: payload.senderId },
          { buyerAgent: payload.senderId },
        ],
      });

      if (!checkSender)
        throw new NotFoundException(`Sender not found in the conversation`);

      const sendTime = new Date();
      const formattedSendTime = format(sendTime, 'yyyy-MM-dd HH:mm:ss');

      // Create the message
      const newMessage = await this.messageModel.create({
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        text: payload.text,
        sendTime: formattedSendTime,
      });

      await newMessage.save();
      console.log(newMessage.senderId);

      const populatedMessage = await this.messageModel
        .findById(newMessage._id)
        .populate('senderId', 'name role'); // Populate the sender's details (including role)

      // Include the role in the response
      const senderRole =
        payload.senderId === conversation.seller?.toString()
          ? 'Seller'
          : payload.senderId === conversation.sellerAgent?.toString()
            ? 'Seller Agent'
            : payload.senderId === conversation.buyerAgent?.toString()
              ? 'Buyer Agent'
              : 'Unknown';

      console.log(senderRole);

      return {
        ...populatedMessage.toObject(),
        senderRole,
      };

      return newMessage;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async uploadFileToS3(fileBuffer: Buffer, filename: string): Promise<string> {
    return await this.awsS3Service.uploadFile(fileBuffer, filename);
  }

  // Function to get all messages for a specific conversation
  async getMessagesForConversation(conversationId: string) {
    try {
      // Validate if the conversation exists
      const conversation =
        await this.conversationModel.findById(conversationId);
      if (!conversation) {
        throw new BadGatewayException('Conversation not found');
      }

      // Fetch all messages for the conversation
      const messages = await this.messageModel
        .find({ conversationId })
        .sort({ createdAt: 1 }) // Sorting messages by creation time
        .exec();

      return messages;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  // Function to get a single message by ID
  async getMessageById(messageId: string) {
    try {
      const message = await this.messageModel.findById(messageId).exec();
      if (!message) {
        throw new BadGatewayException('Message not found');
      }
      return message;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
