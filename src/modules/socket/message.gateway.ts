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
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationService } from '../conversation/service/conversation.service';
import { MessageService } from '../message/message.service';
import {
  MessageServiceSocketEnum,
  SocketErrorEnum,
} from './socketEnum/message.enum';
import { CreateConversationDto } from '../conversation/dto/conversatin.dto';
import { AwsS3Service } from '../uploader/aws';
import { JwtService } from '@nestjs/jwt';
import { decodeJwtToken } from 'src/utils/jwt.util';

export type MemberDto = {
  memberId: string;
};

export type ConversationDto = {
  conversationId: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'property/message',
})
@UsePipes(new ValidationPipe({ transform: true }))
export class MessageServiceGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(MessageServiceGateway.name);
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly awsS3Service: AwsS3Service,
    private readonly jwtService: JwtService,
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

  @SubscribeMessage(MessageServiceSocketEnum.CREATE_CONVERSATION)
  async createConversation(
    @MessageBody()
    payload: CreateConversationDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const authHeader = client.handshake.headers.authorization as string;
      if (!authHeader) {
        throw new WsException('Authorization token is required.');
      }
      const token = authHeader;
      console.log(token);
      if (!token) {
        throw new WsException('Invalid authorization header format.');
      }

      let decoded: any;

      try {
        decoded = decodeJwtToken(token);
        console.log(decoded.id);
      } catch (err) {
        throw new WsException('Invalid or expired token.');
      }

      // Extract user ID and account type from the token
      const userId = decoded.id;
      console.log(userId);

      const updatedPayload: CreateConversationDto = {
        ...payload,
        buyerAgent: userId, // Assign userId to buyerAgent
      };

      if (!updatedPayload.buyerAgent) {
        throw new WsException('buyerAgent is required in the payload.');
      }

      console.log('Final Payload:', updatedPayload);
      // Example: Assign user ID to buyerId
      const createConv = await this.conversationService.Create(updatedPayload);

      client.emit(
        MessageServiceSocketEnum.CONVERSATION_CREATED,

        JSON.stringify({
          conversation: createConv,
        }),
      );
    } catch (error) {
      client.emit(SocketErrorEnum.ERROR, error?.message);
      this.logger.error(
        `MessageServiceGateway.handleCreateConversation, ${error}`,
      );
    }
  }

  @SubscribeMessage(MessageServiceSocketEnum.LIST_CONVERSATION)
  async ListConversations(
    @MessageBody() payload: MemberDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const authHeader = client.handshake.headers.authorization as string;
      if (!authHeader) {
        throw new WsException('Authorization token is required.');
      }

      const token = authHeader;
      if (!token) {
        throw new WsException('Invalid authorization header format.');
      }

      let decoded: any;
      try {
        decoded = decodeJwtToken(token);
        console.log(decoded.id);
      } catch (err) {
        throw new WsException('Invalid or expired token.');
      }

      // Extract user ID and account type from the token
      const userId = decoded.id;

      const listConvs =
        await this.conversationService.getConversationsByMember(userId);

      client.emit(
        MessageServiceSocketEnum.CONVERSATION_LISTED,

        JSON.stringify({
          conversations: listConvs,
        }),
      );
    } catch (error) {
      this.logger.error(
        `MessageServiceGateway.handleListConversations, ${error}`,
      );
    }
  }

  @SubscribeMessage(MessageServiceSocketEnum.GET_CONVERSATION)
  async ListOneConversations(
    @MessageBody() payload: ConversationDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const listOneConvs = await this.conversationService.getOneConversation(
        payload.conversationId,
      );

      client.emit(
        MessageServiceSocketEnum.CONVERSATION_RETRIEVED,

        JSON.stringify({
          conversation: listOneConvs,
        }),
      );
    } catch (error) {
      this.logger.error(
        `MessageServiceGateway.handleListOneConversations, ${error}`,
      );
    }
  }

  /////////   MESSAGE ////////

  @SubscribeMessage(MessageServiceSocketEnum.SEND_MESSAGE)
  async SendMessage(
    @MessageBody()
    payload: {
      conversationId: string;
      senderId: string;
      text?: string;
      file?: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const authHeader = client.handshake.headers.authorization as string;
      if (!authHeader) {
        throw new WsException('Authorization token is required.');
      }

      const token = authHeader;
      if (!token) {
        throw new WsException('Invalid authorization header format.');
      }

      let decoded: any;
      try {
        decoded = decodeJwtToken(token);
        console.log(decoded.id);
      } catch (err) {
        throw new WsException('Invalid or expired token.');
      }

      // Extract user ID and account type from the token
      const userId = decoded.id;
      let fileKey: string | null = null;

      // Check if there's a file in the payload, upload it to S3
      if (payload.file) {
        fileKey = await this.awsS3Service.uploadFile(
          payload.file.buffer,
          payload.file.filename,
        );
      }
      const createMsg = await this.messageService.createMessage({
        conversationId: payload.conversationId,
        senderId: userId,
        text: payload.text,
        file: fileKey,
      });

      client.emit(
        MessageServiceSocketEnum.MESSAGE_SENT,

        JSON.stringify({
          message: createMsg,
        }),
      );
    } catch (error) {
      client.emit(SocketErrorEnum.ERROR, error?.message);
      this.logger.error(`MessageServiceGateway.handleSendMessage, ${error}`);
    }
  }

  @SubscribeMessage('uploadFile')
  async handleFileUpload(
    @ConnectedSocket() client: Socket,
    @MessageBody() fileData: { filename: string; buffer: Buffer },
  ) {
    try {
      const fileKey = await this.awsS3Service.uploadFile(
        fileData.buffer,
        fileData.filename,
      );
      client.emit('fileUploaded', { status: 'success', fileKey });
    } catch (error) {
      client.emit('error', 'File upload failed');
    }
  }

  @SubscribeMessage(MessageServiceSocketEnum.LIST_MESSAGES)
  async GetMessages(
    @MessageBody() payload: ConversationDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const listMessages = await this.messageService.getMessagesForConversation(
        payload.conversationId,
      );

      client.emit(
        MessageServiceSocketEnum.MESSAGES_LISTED,

        JSON.stringify({
          messages: listMessages,
        }),
      );
    } catch (error) {
      this.logger.error(`MessageServiceGateway.handleGetMessages, ${error}`);
    }
  }
}
