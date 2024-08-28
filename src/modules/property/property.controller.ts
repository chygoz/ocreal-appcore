import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
  AgentCreatePropertyDto,
  CreatePropertyDTO,
  CreatePropertyDto,
  PropertyOfferComment,
  SavePropertyQueryDTO,
  SellerOrAgentPublishPropertyDto,
  UpdatePropertyDto,
} from './dto/property.dto';
import { PropertyService } from './property.service';
import { SellerAuthGuard } from 'src/guards/seller.gaurd';
import { IsPublic } from 'src/guards/isPublic.gaurd';
import { PaginationDto } from 'src/constants/pagination.dto';
import { JwtAgentAuthGuard } from 'src/guards/agent.guard';
import {
  CreateTourDto,
  PropertyTourScheduleDto,
  UpdatePropertyTourScheduleDto,
} from './dto/tour.dto';
import {
  AddPropertyCoBuyerDto,
  CreateAgentPropertyOfferDto,
  CreateCounterOfferDto,
  CreateUserOfferDto,
  OfferResponseDto,
  SellerOrSellerAgentAcceptOffer,
} from './dto/offer.dto';
import { AgentOrSellerAuthGuard } from 'src/guards/seller_or_agent.guard';
import { AccountTypeEnum } from 'src/constants';
import { CreateSharePropertyDocDto } from './dto/shareDocument.dto';

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

  @UseGuards(JwtAuthGuard)
  @Post('/buyer/submit/offer/:id')
  async buyerSubmitOffer(@Req() req: Request, @Res() res: Response) {
    const offerId = req.params.id;
    const result = await this.propertyService.buyerSubmitOffer(
      offerId,
      req.user,
    );
    this._sendResponse({
      res,
      data: { result },
      message: 'Offer Submitted',
      statusCode: 200,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Post('/agent/submit/offer/:id')
  async buyerAgentSubmitOffer(@Req() req: Request, @Res() res: Response) {
    const id = req.params.id;
    const result = await this.propertyService.buyerAgentSubmitOffer(
      req.agent,
      id,
    );
    this._sendResponse({
      res,
      data: { result },
      message: 'Offer Submitted',
      statusCode: 200,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Post('offer/comment')
  async addOfferComment(
    @Body() dto: PropertyOfferComment,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.agent || req.user;
    const comment = await this.propertyService.addOfferComment(dto, user);
    this._sendResponse({
      res,
      data: { comment },
      message: 'Property Offer Comment Created',
      statusCode: 201,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Get('/all/offer/comments/:id')
  async getOfferComment(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const id = req.params.id;
    const user = req.agent || req.user;
    const data = await this.propertyService.getOfferComment(
      paginationDto,
      id,
      user,
    );
    this._sendResponse({
      res,
      message: 'Offer Found',
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Get('/analytics/:id')
  async getPropertyAnalytics(@Res() res: Response, @Req() req: Request) {
    const id = req.params.id;
    const data = await this.propertyService.getPropertyAnalytics(id);
    this._sendResponse({
      res,
      message: 'Property Analytics Done',
      data,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Post('agent/create')
  async agentCreateProperty(
    @Body() createPropertyDto: AgentCreatePropertyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const property = await this.propertyService.agentCreateProperty(
      createPropertyDto,
      req.agent,
    );
    this._sendResponse({
      res,
      data: { property },
      message: 'Property Created',
      statusCode: 201,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Post('save/property/search-result')
  async savePropertySearchResult(
    @Body() dto: SavePropertyQueryDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const property = await this.propertyService.savePropertySearchResult(
      dto,
      req.agent || req.user,
    );
    this._sendResponse({
      res,
      data: { property },
      message: 'Property search saved',
      statusCode: 201,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Post('share/property/document')
  async sharePropertyDocument(
    @Body() dto: CreateSharePropertyDocDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const share = await this.propertyService.sharePropertyDocument(
      req.agent || req.user,
      dto,
    );
    this._sendResponse({
      res,
      data: { share },
      message: 'Property Document Shared',
      statusCode: 201,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Get('share/property/documents/:id')
  async getAllSharedDocuments(@Req() req: Request, @Res() res: Response) {
    const id = req.params.id;
    const documentsShareList = await this.propertyService.getAllSharedDocuments(
      req.agent || req.user,
      id,
    );
    this._sendResponse({
      res,
      data: { documentsShareList },
      message: 'Property Documents Found',
      statusCode: 200,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Delete('remove/property/document/:id')
  async removeSharedDocumentAccess(@Req() req: Request, @Res() res: Response) {
    const id = req.params.id;
    await this.propertyService.removeSharedDocumentAccess(
      req.agent || req.user,
      id,
    );
    this._sendResponse({
      res,
      message: 'Property Document Removed',
      statusCode: 200,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Get('query/propeties-details/:unparsedAddress')
  async queryPropertiesByAddress(@Req() req: Request, @Res() res: Response) {
    const unparsedAddress = req.params.unparsedAddress;
    console.log(unparsedAddress);
    const result =
      await this.propertyService.queryPropertiesByAddress(unparsedAddress);
    this._sendResponse({
      res,
      data: { result },
      message: 'Properties Found',
      statusCode: 200,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/buyer/create/offer')
  async createUserPropertyOffer(
    @Body() dto: CreateUserOfferDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.propertyService.createUserPropertyOffer(
      dto,
      req.user,
    );
    this._sendResponse({
      res,
      data: { result },
      message: 'Offer Created',
      statusCode: 201,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/buyer/offer/response')
  async buyerOfferResponse(
    @Body() dto: OfferResponseDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.propertyService.buyerOfferResponse(dto, req.user);
    this._sendResponse({
      res,
      data: { result },
      message: 'Offer Created',
      statusCode: 201,
    });
  }

  @UseGuards(SellerAuthGuard)
  @Post('/seller/create/counter-offer/:id')
  async sellerCreateOrUpdateCounterOffer(
    @Body() dto: CreateCounterOfferDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const propertyId = req.params.id;
    const result = await this.propertyService.sellerCreateOrUpdateCounterOffer(
      dto,
      propertyId,
      req.user,
    );
    this._sendResponse({
      res,
      data: { result },
      message: 'Counter Offer Created',
      statusCode: 200,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Post('/agent/create/counter-offer/:id')
  async sellerAgentCreateOrUpdateCounterOffer(
    @Body() dto: CreateCounterOfferDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const propertyId = req.params.id;
    const result =
      await this.propertyService.sellerAgentCreateOrUpdateCounterOffer(
        dto,
        propertyId,
        req.agent,
      );
    this._sendResponse({
      res,
      data: { result },
      message: 'Counter Offer Created',
      statusCode: 200,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Post('/agent/create/offer')
  async createAgentPropertyOffer(
    @Body() dto: CreateAgentPropertyOfferDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.propertyService.createAgentPropertyOffer(
      dto,
      req.agent,
    );
    this._sendResponse({
      res,
      data: { result },
      message: 'Offer Created',
      statusCode: 201,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('schedule/tour')
  async scheduleTour(
    @Body() dto: CreateTourDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (req.active_user_role !== AccountTypeEnum.BUYER) {
      throw new BadRequestException('Only Buyers can schedule tours');
    }
    const tour = await this.propertyService.scheduleTour(dto, req.user);
    this._sendResponse({
      res,
      data: { tour },
      message: 'Tour Scheduled',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('user/save-property/:id')
  async saveUserProperty(@Req() req: Request, @Res() res: Response) {
    const id = req.params.id;
    const result = await this.propertyService.saveUserProperty(id, req.user);
    this._sendResponse({
      res,
      data: { result },
      message: 'Property Saved',
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Put('update/:id')
  async updateProperty(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const property = await this.propertyService.updateProperty(
      updatePropertyDto,
      req?.user || req?.agent,
      id,
    );
    this._sendResponse({
      res,
      data: { property },
      message: 'Property Updated',
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Get('/single/offer/:id')
  async getSingleOffer(@Res() res: Response, @Req() req: Request) {
    const id = req.params.id;

    const data = await this.propertyService.getSingleOffer(id);
    this._sendResponse({
      res,
      message: 'Offer Found',
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Get('/all/property/offers/:id')
  async getAPropertyOffers(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const id = req.params.id;

    const data = await this.propertyService.getAPropertyOffers(
      paginationDto,
      id,
    );
    this._sendResponse({
      res,
      message: 'Offer Found',
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Post('/verify/property/ownership/:id')
  async verifyPropertyOwnerShip(
    @Res() res: Response,
    @Req() req: Request,
    @Body() dto: CreatePropertyDTO,
  ) {
    const id = req.params.id;

    const data = await this.propertyService.verifyPropertyOwnerShip(
      req.user || req.agent,
      dto,
      id,
      req.user ? 'User' : 'Agent',
    );
    this._sendResponse({
      res,
      message: 'Property verification process started.',
      data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/buying/properties')
  async getUserBuyingProperties(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getUserBuyingProperties(
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
  @Get('/user/selling/properties')
  async getUserSellingProperties(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getUserSellingProperties(
      paginationDto,
      req.user,
    );
    this._sendResponse({
      res,
      message: 'Properties Found',
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Post('/seller/offer/response')
  async sellerOrSellerAgentResponsetoOffer(
    @Res() res: Response,
    @Req() req: Request,
    @Body() dto: SellerOrSellerAgentAcceptOffer,
  ) {
    const data = await this.propertyService.sellerOrSellerAgentResponsetoOffer(
      dto,
      req.user,
    );
    this._sendResponse({
      res,
      message: `Property Offer ${dto.response ? 'Accepted' : 'Rejected'}.`,
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Put('/publish-property/:id')
  async sellerOrAgentPublishOrUnpublishProperty(
    @Res() res: Response,
    @Req() req: Request,
    @Body() dto: SellerOrAgentPublishPropertyDto,
  ) {
    const id = req.params.id;
    const data =
      await this.propertyService.sellerOrAgentPublishOrUnpublishProperty(
        id,
        req.user || req.agent,
        dto,
      );
    this._sendResponse({
      res,
      message: `Property has been ${dto.publish ? 'Published' : 'Unpublished'}.`,
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Post('add/tour-schedule')
  async agentOrSellerAddTourSchedule(
    @Res() res: Response,
    @Req() req: Request,
    @Body() dto: PropertyTourScheduleDto,
  ) {
    const data = await this.propertyService.agentOrSellerAddTourSchedule(
      req.user || req.agent,
      dto,
    );
    this._sendResponse({
      res,
      message: `Property Tour Schedule Added.`,
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Put('update/tour-schedule/:id')
  async agentOrSellerUpdateTourSchedule(
    @Res() res: Response,
    @Req() req: Request,
    @Body() dto: UpdatePropertyTourScheduleDto,
  ) {
    const id = req.params.id;
    const data = await this.propertyService.agentOrSellerUpdateTourSchedule(
      id,
      req.user || req.agent,
      dto,
    );
    this._sendResponse({
      res,
      message: `Property Tour Schedule Updated.`,
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Post('complete/offer/title&Escrow/:id')
  async buyerOrAgentCompleteOfferTitleAndEscrow(
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const id = req.params.id;
    const data =
      await this.propertyService.buyerOrAgentCompleteOfferTitleAndEscrow(
        req.user || req.agent,
        id,
      );
    this._sendResponse({
      res,
      message: `Offer Title And Escrow Stage Completed.`,
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Post('add/offer/co-buyer/:id')
  async addOfferCoBuyer(
    @Res() res: Response,
    @Req() req: Request,
    @Body() dto: AddPropertyCoBuyerDto,
  ) {
    const id = req.params.id;
    const data = await this.propertyService.addOfferCoBuyer(
      req.user || req.agent,
      id,
      dto,
    );
    this._sendResponse({
      res,
      message: `Offer Co-Buyer Updated.`,
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Delete('delete/tour-schedule/:id')
  async agentOrSellerDeleteTourSchedule(
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const id = req.params.id;
    await this.propertyService.agentOrSellerDeleteTourSchedule(
      id,
      req.user || req.agent,
    );
    this._sendResponse({
      res,
      message: `Property Tour Schedule Deleted.`,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Get('/get/tour-schedules')
  async getAgentOrSellerTourSchedules(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getAgentOrSellerTourSchedules(
      paginationDto,
      req.user || req.agent,
    );
    this._sendResponse({
      res,
      message: 'Property Tour Schedules Found.',
      data,
    });
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Delete('/delete/:id')
  async deleteSingleProperty(@Res() res: Response, @Req() req: Request) {
    const id = req.params.id;
    const data = await this.propertyService.deleteSingleProperty(id, req.user);
    this._sendResponse({
      res,
      message: 'Properties deleted successfully',
      data,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('/agent/buyer/properties')
  async getAgentBuyerProperties(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getAgentBuyerProperties(
      paginationDto,
      req.agent,
    );
    this._sendResponse({
      res,
      message: 'Properties Found',
      data,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('/agent/seller/properties')
  async getAgentSellerProperties(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getAgentSellerProperties(
      paginationDto,
      req.agent,
    );
    this._sendResponse({
      res,
      message: 'Properties Found',
      data,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('/agent/incoming/offers')
  async getAgentIncomingPropertyOffers(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getAgentIncomingPropertyOffers(
      paginationDto,
      req.agent,
    );
    this._sendResponse({
      res,
      message: 'Offers Found',
      data,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('/agent/outgoing/offers')
  async getAgentOutGoingPropertyOffers(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getAgentOutGoingPropertyOffers(
      paginationDto,
      req.agent,
    );
    this._sendResponse({
      res,
      message: 'Offers Found',
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
  @Get('/user/future/tours')
  async getUserFutureTours(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getUserFutureTours(
      paginationDto,
      req.user,
    );
    this._sendResponse({
      res,
      message: 'Tours Found',
      data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/past/tours')
  async getUserPastTours(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getUserPastTours(
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

  @UseGuards(JwtAgentAuthGuard)
  @Get('/agent/invites')
  async getAgentPropertyinvites(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getAgentPropertyinvites(
      paginationDto,
      req.agent,
    );
    this._sendResponse({
      res,
      message: 'Invites Found',
      data,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Get('/agent/invites')
  async getAgentInvites(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.propertyService.getAgentInvites(
      paginationDto,
      req.agent,
    );
    this._sendResponse({
      res,
      message: 'Invites Found',
      data,
    });
  }

  @UseGuards(SellerAuthGuard)
  @Post('add/agent')
  async addAgentToProperty(
    @Body() data: AddAgentToPropertyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.propertyService.addAgentToProperty(
      req.user,
      req.active_user_role,
      data,
    );
    this._sendResponse({
      res,
      data: { result },
      message: 'Agent Added',
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Put('agent/response/property-invite/')
  async agentAcceptInviteToProperty(
    @Body() data: AgentAcceptInviteDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.propertyService.agentAcceptInviteToProperty(
      req.agent,
      data,
    );
    this._sendResponse({
      res,
      data: { result },
      message: 'Agent Accepted Invite',
    });
  }

  // @UseGuards(JwtAgentAuthGuard)
  // @Put('agent/response/:id')
  // async publishProperty(@Req() req: Request, @Res() res: Response) {
  //   const id = req.params.id;
  //   const result = await this.propertyService.publishProperty(req.agent, id);
  //   this._sendResponse({
  //     res,
  //     data: { result },
  //     message: 'Property published.',
  //   });
  // }

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
