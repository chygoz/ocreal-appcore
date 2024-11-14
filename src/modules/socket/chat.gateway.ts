import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AwsS3Service } from '../uploader/aws';
import { OpenConversationService } from '../conversation/service/openConversation.service';
import { OpenMessageService } from '../message/openmessage.service';
import {
  OpenMessageServiceSocketEnum,
  SocketErrorEnum,
} from './socketEnum/message.enum';
import { Types } from 'mongoose';

export type ConversationDto = {
  propertyId: string;
};

export type ListMessageDto = {
  conversationId: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'agent-message',
})
@UsePipes(new ValidationPipe({ transform: true }))
export class OpenMessageServiceGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(OpenMessageServiceGateway.name);
  constructor(
    private readonly openConversationService: OpenConversationService,
    private readonly openMessageService: OpenMessageService,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('MessageServiceGateway Socket Connected and running');
    server.disconnectSockets();
  }

  @SubscribeMessage(OpenMessageServiceSocketEnum.OPEN_CONVERSATION)
  async createOpenConversation(
    @MessageBody()
    payload: { propertyId: string; agentId?: string; userId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const createConv =
        await this.openConversationService.createConversation(payload);

      client.emit(
        OpenMessageServiceSocketEnum.CONVERSATION_OPENED,

        JSON.stringify({
          conversation: createConv,
        }),
      );
    } catch (error) {
      client.emit(SocketErrorEnum.ERROR, error?.message);
      this.logger.error(
        `MessageServiceGateway.handleCreateOpenConversation, ${error}`,
      );
    }
  }

  @SubscribeMessage(OpenMessageServiceSocketEnum.LIST_OPEN_CONVERSATION)
  async getConversationByProperty(
    @MessageBody()
    payload: ConversationDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const conversations =
        await this.openConversationService.getConversationByProperty(
          payload.propertyId,
        );

      client.emit(
        OpenMessageServiceSocketEnum.OPEN_CONVERSATION_LISTED,

        JSON.stringify({
          conversation: conversations,
        }),
      );
    } catch (error) {
      client.emit(SocketErrorEnum.ERROR, error?.message);
      this.logger.error(
        `MessageServiceGateway.handleCreateOpenConversation, ${error}`,
      );
    }
  }

  @SubscribeMessage(OpenMessageServiceSocketEnum.JOIN_CONVERSATION)
  async addMemberToConversation(
    @MessageBody()
    payload: {
      conversationId: string;
      memberId: string;
      memberType: 'Agent' | 'User';
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Log the join request for monitoring
      this.logger.log(`Adding member to conversation: ${payload}`);

      // Add member to the conversation
      const updatedConversation =
        await this.openConversationService.addMemberToConversation(
          payload.conversationId,
          new Types.ObjectId(payload.memberId),
          payload.memberType,
        );

      // Notify the client with the updated conversation
      client.emit(
        OpenMessageServiceSocketEnum.CONVERSATION_JOINED,
        JSON.stringify({ conversation: updatedConversation }),
      );

      this.logger.log(
        `Member added to conversation successfully: ${updatedConversation._id}`,
      );
    } catch (error) {
      client.emit(
        SocketErrorEnum.ERROR,
        error?.message || 'Failed to add member to conversation',
      );
      this.logger.error(
        `MessageServiceGateway.addMemberToConversation error: ${error.message}`,
      );
    }
  }

  @SubscribeMessage(OpenMessageServiceSocketEnum.SEND_CHAT_MESSAGE)
  async addMessageToConversation(
    @MessageBody()
    payload: {
      conversationId: string;
      senderId: Types.ObjectId;
      messageContent: string;
      attachmentUrl?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.openMessageService.addMessageToConversation(
        payload.conversationId,
        payload.senderId,
        payload.messageContent,
        payload.attachmentUrl,
      );

      client.emit(
        OpenMessageServiceSocketEnum.CHAT_MESSAGE_SENT,

        JSON.stringify({
          conversation: message,
        }),
      );
    } catch (error) {
      client.emit(SocketErrorEnum.ERROR, error?.message);
      this.logger.error(
        `MessageServiceGateway.handleMessageToConversation, ${error}`,
      );
    }
  }

  @SubscribeMessage(OpenMessageServiceSocketEnum.LIST_CHAT_MESSAGES)
  async getMessagesFromConversation(
    @MessageBody()
    payload: ListMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const messages =
        await this.openMessageService.getMessagesFromConversation(
          payload.conversationId,
        );

      client.emit(
        OpenMessageServiceSocketEnum.CHAT_MESSAGE_LISTED,

        JSON.stringify({
          conversation: messages,
        }),
      );
    } catch (error) {
      client.emit(SocketErrorEnum.ERROR, error?.message);
      this.logger.error(
        `MessageServiceGateway.handleGetMessagesFromConversation, ${error}`,
      );
    }
  }
}
