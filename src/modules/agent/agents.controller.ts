import {
  Controller,
  Post,
  Body,
  Res,
  Put,
  Req,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AgentsService } from './agents.service';
import { OnboardAgentDto, UpdateAgentDto } from './dto';
import { JwtAgentAuthGuard } from 'src/guards/agent.guard';
import { PaginationDto } from '../../constants/pagination.dto';
import { JwtAuthGuard } from 'src/guards/auth-jwt.guard';

@Controller('agent')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @UseGuards(JwtAgentAuthGuard)
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
      message: 'Agent Onboarded',
      data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/invited-agents')
  async getUserInvitedAgent(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.agentsService.getUserInvitedAgent(
      req.user.id,
      paginationDto,
    );
    this._sendResponse({
      res,
      message: 'Agents Found',
      data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search')
  async searchForAgents(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.agentsService.searchForAgents(paginationDto);
    this._sendResponse({
      res,
      message: 'Agents Found',
      data,
    });
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('/invite')
  // async inviteAgent(
  //   @Res() res: Response,
  //   @Req() req: Request,
  //   @Body() dto: InviteAgentDto,
  // ) {
  //   const data = await this.agentsService.inviteAgent(
  //     dto,
  //     req.user,
  //     req.active_user_role,
  //   );
  //   this._sendResponse({
  //     res,
  //     message: 'Agent Invited',
  //     data,
  //   });
  // }

  @UseGuards(JwtAgentAuthGuard)
  @Put('/profile/update')
  async updateAgentProfile(
    @Body() profile: UpdateAgentDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const data = await this.agentsService.updateAgentProfile(
      req.agent,
      profile,
    );
    this._sendResponse({
      res,
      message: 'Profile Updated',
      data,
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
      success: statusCode >= 300 ? false : true,
    };
    const statsu_code = statusCode ? statusCode : 200;
    res.status(statsu_code).json(responseData);
  }
}
