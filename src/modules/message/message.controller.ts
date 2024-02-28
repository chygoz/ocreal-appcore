import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { MessageService } from './message.service';
import { JwtAuthGuard } from 'src/guards/auth-jwt.guard';
import {
  CreateUserMessageDto,
  CreateAgentMessageDto,
  CreateChatDto,
} from './dto/createMessage.dto';
import { MessageTypeEnum } from './schema/message.schema';
import { Types } from 'mongoose';
import { JwtAgentAuthGuard } from 'src/guards/agent.guard';
import { UserTypeEnum } from './schema/chat.shcema';
import { PaginationDto } from 'src/constants/pagination.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create/user/user-message')
  async createUserMessage(
    @Body() messageDto: CreateUserMessageDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const payload: any = {
      user: req.user._id,
      agent: new Types.ObjectId(messageDto.agent),
      property: messageDto.property,
      messageType: MessageTypeEnum.userToAgent,
    };
    const message = await this.messageService.createMessage(payload);
    this._sendResponse({
      res,
      message: 'New Message created successfully',
      data: {
        message,
      },
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Post('create/user/agent-message')
  async createAgentMessage(
    @Body() messageDto: CreateAgentMessageDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const payload: any = {
      agent: req.agent,
      user: new Types.ObjectId(messageDto.user),
      property: messageDto.property,
      messageType: MessageTypeEnum.userToAgent,
    };
    const message = await this.messageService.createMessage(payload);
    this._sendResponse({
      res,
      message: 'New Message created successfully',
      data: {
        message,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('send/user/chat')
  async sendUserChat(
    @Body() chatDto: CreateChatDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const payload = {
      ...chatDto,
      sender: req.user,
      senderType: UserTypeEnum.user,
    };
    const chat = await this.messageService.createChat(payload);
    this._sendResponse({
      res,
      message: 'Chat sent successfully',
      data: {
        chat,
      },
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Post('send/agent/chat')
  async sendAgentChat(
    @Body() chatDto: CreateChatDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const payload = {
      ...chatDto,
      sender: req.agent,
      senderType: UserTypeEnum.agent,
    };
    const message = await this.messageService.createChat(payload);
    this._sendResponse({
      res,
      message: 'Chat sent successfully',
      data: {
        message,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/chats/:id')
  async getUserMessageChats(
    // @Param('id') dto: IsMongoIdDto,
    @Res() res: Response,
    @Query() paginationDto: PaginationDto,
    @Req() req: Request,
  ) {
    const id = req.params.id;
    const data = await this.messageService.findMessageChats(id, paginationDto);
    this._sendResponse({
      res,
      message: 'Chats found',
      data,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('agent/chats/:id')
  async getAgentMessageChats(
    @Res() res: Response,
    @Query() paginationDto: PaginationDto,
    @Req() req: Request,
  ) {
    const id = req.params.id;
    const data = await this.messageService.findMessageChats(id, paginationDto);
    this._sendResponse({
      res,
      message: 'Chats found',
      data,
    });
  }

  // @Get()
  // async getAllMessages(
  //   @GetCurrentUserId() cognito_id: string,
  //   @Res() res: Response,
  // ) {
  //   const data = await this.buyerMessageService.findMessages(cognito_id);
  //   return res.status(HttpStatus.OK).json({
  //     message: 'Messages found',
  //     data,
  //   });
  // }

  private _sendResponse({
    res,
    message,
    statusCode,
    data,
  }: {
    res: Response;
    message: string;
    statusCode?: number;
    data?: any;
  }): void {
    const responseData = {
      message,
      data,
    };
    const status_code = statusCode ? statusCode : 200;
    res.status(status_code).json(responseData);
  }
}
