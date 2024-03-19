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
import { AgentOrSellerAuthGuard } from 'src/guards/seller_or_agent.guard';
import { PaginationDto } from 'src/constants/pagination.dto';

@UseGuards(AgentOrSellerAuthGuard)
@Controller('Notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.notificationService.getUserNotifications(
      req.user.id || req.agent.id,
      paginationDto,
    );
    return this._sendResponse({
      res,
      data,
      message: 'Notifications Found',
    });
  }

  @Put('read/one/:id')
  async markOneAsRead(@Res() res: Response, @Req() req: Request) {
    const data = await this.notificationService.markOneAsRead(req.params.id);
    return this._sendResponse({
      res,
      data,
      message: 'Narked as read.',
    });
  }

  @Put('read/all/')
  markAllAsRead(@Res() res: Response, @Req() req: Request) {
    const data = this.notificationService.markAllAsRead(req.user.id);
    return this._sendResponse({
      res,
      data,
      message: 'Notifications marked as read',
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
