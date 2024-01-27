import {
  Controller,
  Post,
  Body,
  Res,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AgentsService } from './agents.service';
import { OnboardAgentDto, UpdateAgentDto } from './dto';
import { JwtAgentAuthGuard } from 'src/guards/agent.guard';

@UseGuards(JwtAgentAuthGuard)
@Controller('agent')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('/onboard-agent')
  async onboardAgent(
    @Body() onboardAgentDto: OnboardAgentDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const data = await this.agentsService.onboardAgent(
      req.agent.id,
      onboardAgentDto,
    );
    this._sendResponse({
      res,
      message: 'Email sent successfully',
      data,
    });
  }

  @Put('/profile/update')
  async updateProfile(
    @Body() profile: UpdateAgentDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    await this.agentsService.updateAgentProfile(req.agent, profile);
    this._sendResponse({
      res,
      message: 'Email sent successfully',
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
    const statsu_code = statusCode ? statusCode : 200;
    res.status(statsu_code).json(responseData);
  }
}
