import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/guards/auth-jwt.guard';
import {
  AddAgentToPropertyDto,
  AgentAcceptInviteDto,
  CreatePropertyDto,
  UpdatePropertyDto,
} from './dto/property.dto';
import { PropertyService } from './property.service';
import { SellerAuthGuard } from 'src/guards/seller.gaurd';
import { IsPublic } from 'src/guards/isPublic.gaurd';
import { PaginationDto } from 'src/constants/pagination.dto';
import { JwtAgentAuthGuard } from 'src/guards/agent.guard';
import { CreateTourDto } from './dto/tour.dto';
import { CreateOfferDto } from './dto/offer.dto';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @UseGuards(IsPublic)
  @Get('')
  async getProperties(
    @Req() req: Request,
    @Res() res: Response,
    @Query() paginationDto: PaginationDto,
  ) {
    const properties = await this.propertyService.getProperties(paginationDto);
    this._sendResponse({
      res,
      data: { ...properties },
      message: 'Properties Found',
    });
  }

  @UseGuards(JwtAuthGuard, SellerAuthGuard)
  @Post('create')
  async createProperty(
    @Body() createPropertyDto: CreatePropertyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const property = await this.propertyService.createProperty(
      createPropertyDto,
      req.user,
    );
    this._sendResponse({
      res,
      data: { property },
      message: 'Property Created',
      statusCode: 201,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Post('create/offer')
  async createPropertyOffer(
    // @Body() dto: CreateOfferDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('Something');
    const offer = await this.propertyService.createPropertyOffer(
      // dto,
      req.agent,
    );
    this._sendResponse({
      res,
      data: { offer },
      message: 'Offer Created',
      statusCode: 201,
    });
  }

  @UseGuards(JwtAuthGuard, SellerAuthGuard)
  @Post('schedule/tour')
  async scheduleTour(
    @Body() dto: CreateTourDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tour = await this.propertyService.scheduleTour(dto, req.user);
    this._sendResponse({
      res,
      data: { tour },
      message: 'Tour Scheduled',
    });
  }

  @UseGuards(JwtAuthGuard, SellerAuthGuard)
  @Put('update/:id')
  async updateProperty(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const property = await this.propertyService.updateProperty(
      updatePropertyDto,
      req.user,
      id,
    );
    this._sendResponse({
      res,
      data: { property },
      message: 'Property Updated',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/properties')
  async searchForAgents(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getUserProperties(
      paginationDto,
      req.user,
    );
    this._sendResponse({
      res,
      message: 'Properties Found',
      data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/agent/recent/tour')
  async getAgentMostRecentTour(@Res() res: Response, @Req() req: Request) {
    const data = await this.propertyService.getAgentMostRecentTour(req.agent);
    this._sendResponse({
      res,
      message: 'Tour Found',
      data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/tours')
  async getUserTours(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getUserTours(
      paginationDto,
      req.user,
    );
    this._sendResponse({
      res,
      message: 'Tours Found',
      data,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('/agent/tours')
  async getAgentUpcomingTours(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getAgentUpcomingTours(
      paginationDto,
      req.agent,
    );
    this._sendResponse({
      res,
      message: 'Tours Found',
      data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('add/agent')
  async addAgentToProperty(
    @Body() data: AddAgentToPropertyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const property = await this.propertyService.addAgentToProperty(
      req.active_user_role,
      data,
    );
    this._sendResponse({
      res,
      data: { property },
      message: 'Agent Added',
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Put('agent/accept/invite')
  async agentAcceptInviteToProperty(
    @Body() data: AgentAcceptInviteDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const property = await this.propertyService.agentAcceptInviteToProperty(
      req.agent,
      data,
    );
    this._sendResponse({
      res,
      data: { property },
      message: 'Agent Accepted Invite',
    });
  }

  @UseGuards(IsPublic)
  @Get('single/:id')
  async getSingleProperty(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const property = await this.propertyService.getSingleProperty(id);
    this._sendResponse({
      res,
      data: { property },
      message: 'Property Found',
    });
  }

  // @Get('property/query/:search')
  // async searchForProperty(@Req() req: Request, @Res() res: Response) {
  //   const search = req.params.search;

  //   const data = this.PropertyService.searchForProperty(search, req.user);
  //   this._sendResponse({
  //     res,
  //     data,
  //     message: 'Plan Created',
  //   });
  // }

  // @Get(':PropertyId')
  // async getPropertyById(@Param('PropertyId') PropertyId: string) {
  //   return this.PropertyService.getPropertyById(PropertyId);
  // }

  // @Delete(':PropertyId')
  // async deleteProperty(@Param('PropertyId') PropertyId: string) {
  //   return this.PropertyService.deleteProperty(PropertyId);
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
