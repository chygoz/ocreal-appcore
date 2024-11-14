import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAgentAuthGuard } from 'src/guards/agent.guard';
// import { PaginationDto } from '../../constants/pagination.dto';
import { JwtAuthGuard } from 'src/guards/auth-jwt.guard';
import { InviteService } from './agentInvite.service';
import { InviteAgentDto, InviteAgentResponseDto } from './dto/agentInvite.dto';
import { PaginationDto } from 'src/constants/pagination.dto';

@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @UseGuards(JwtAuthGuard)
  @Post('agent')
  async inviteAgent(
    @Body() onboardAgentDto: InviteAgentDto,
    @Req() req: Request,
  ) {
    return this.inviteService.inviteAnAgent(req.user.id, onboardAgentDto);
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('/user/invited-agents')
  async getAgentInvites(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.inviteService.getAgentInvites(
      req.agent,
      paginationDto,
    );
    this._sendResponse({
      res,
      message: 'Invites Found',
      data,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('/user/recent/invited-agents')
  async getRecentInvite(@Res() res: Response, @Req() req: Request) {
    const data = await this.inviteService.getRecentInvite(req.agent);
    this._sendResponse({
      res,
      message: 'Recent invite',
      data,
    });
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('/search')
  // async searchForAgents(
  //   @Res() res: Response,
  //   @Req() req: Request,
  //   @Query() paginationDto: PaginationDto,
  // ) {
  //   const data = await this.agentsService.searchForAgents(paginationDto);
  //   this._sendResponse({
  //     res,
  //     message: 'Agents Found',
  //     data,
  //   });
  // }

  @UseGuards(JwtAgentAuthGuard)
  @Post('agent/accept/invite/:id')
  async agentInviteResponse(
    @Res() res: Response,
    @Req() req: Request,
    @Body() dto: InviteAgentResponseDto,
  ) {
    const id = req.params.id;
    const data = await this.inviteService.agentInviteResponse(
      id,
      req.agent,
      dto,
    );
    this._sendResponse({
      res,
      message: 'Agent accepted invite',
      data,
    });
  }

  // @UseGuards(JwtAgentAuthGuard)
  // @Put('/profile/update')
  // async updateProfile(
  //   @Body() profile: UpdateAgentDto,
  //   @Res() res: Response,
  //   @Req() req: Request,
  // ) {
  //   const data = await this.agentsService.updateAgentProfile(
  //     req.agent,
  //     profile,
  //   );
  //   this._sendResponse({
  //     res,
  //     message: 'Profile Updated',
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
      success: statusCode >= 300 ? false : true,
    };
    const statsu_code = statusCode ? statusCode : 200;
    res.status(statsu_code).json(responseData);
  }
}
