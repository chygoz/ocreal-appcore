import {
  Controller,
  Get,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import NotificationService from './notitifcation.service';
import { PaginationDto } from 'src/constants/pagination.dto';
import { AgentOrSellerAuthGuard } from 'src/guards/seller_or_agent.guard';

@UseGuards(AgentOrSellerAuthGuard)
@Controller('Notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @Req() req: Request,
    @Res() res: Response,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await this.notificationService.getAccountNotifications(
      paginationDto,
      req.user.id || req.agent.id,
    );
    this._sendResponse({
      res,
      data: { result },
      message: 'Notifications result.',
    });
  }

  @Put('read/one/:id')
  async markOneAsRead(@Req() req: Request, @Res() res: Response) {
    const result = await this.notificationService.markOneAsRead(req.params.id);
    this._sendResponse({
      res,
      data: { result },
      message: 'Marked',
    });
  }

  @Put('read/all/')
  async markAllAsRead(@Req() req: Request, @Res() res: Response) {
    const result = await this.notificationService.markAllAsRead(req.user.id);
    this._sendResponse({
      res,
      data: { result },
      message: 'Notifications Marked',
    });
  }

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
