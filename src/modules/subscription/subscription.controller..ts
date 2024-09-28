import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreatePlanDto } from './dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/guards/auth-jwt.guard';
import { AdminGuard } from 'src/guards/admin.gaurd';
import { JwtAgentAuthGuard } from 'src/guards/agent.guard';

@Controller('subcription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getUserSubscription(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const data = await this.subscriptionService.getUserSubscription(req.user);
    this._sendResponse({
      res,
      data,
      message: 'Subscription Found',
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('/agent/subcription')
  async getAgentSubscription(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const data = await this.subscriptionService.getAgentSubscription(req.agent);
    this._sendResponse({
      res,
      data,
      message: 'Subscription Found',
    });
  }

  @UseGuards(AdminGuard)
  @Post('/create/plan')
  async onBoardNewuser(
    @Body() creatPlanDto: CreatePlanDto,
    @Res() res: Response,
  ): Promise<any> {
    const data = await this.subscriptionService.createPlan(creatPlanDto);
    this._sendResponse({
      res,
      data,
      message: 'Plan Created',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/subscription/session/:id')
  async getSubscriptionSession(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const data = await this.subscriptionService.getSubscriptionSession(
      req.user,
      req.params.id,
    );
    this._sendResponse({
      res,
      data,
      message: 'Session Created',
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('agent/subscription/session/:id')
  async getAgentSubscriptionSession(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const data = await this.subscriptionService.getAgentSubscriptionSession(
      req.agent,
      req.params.id,
    );
    this._sendResponse({
      res,
      data,
      message: 'Session Created',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/user/cancel/subcription')
  async cancelSubscription(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    await this.subscriptionService.cancelSubscription(req.user);
    this._sendResponse({
      res,
      message: 'Subscription Canceled',
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Put('/agent/cancel/subcription')
  async cancelAgentSubscription(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    await this.subscriptionService.cancelAgentSubscription(req.agent);
    this._sendResponse({
      res,
      message: 'Subscription Canceled',
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
