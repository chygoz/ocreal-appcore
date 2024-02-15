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
  CreatePropertyDto,
  UpdatePropertyDto,
} from './dto/property.dto';
import { PropertyService } from './Property.service';
import { SellerAuthGuard } from 'src/guards/seller.gaurd';
import { IsPublic } from 'src/guards/isPublic.gaurd';
import { PaginationDto } from 'src/constants/pagination.dto';

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
      data: { properties },
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
