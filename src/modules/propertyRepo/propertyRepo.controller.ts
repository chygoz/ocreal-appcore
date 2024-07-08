import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PaginationDto } from 'src/constants/pagination.dto';
import { AgentOrSellerAuthGuard } from 'src/guards/seller_or_agent.guard';
import { CreatePropertyDocumentDto } from '../property/dto/AddProperty.dto';
import { PropertyRepoService } from './propertyRepo.service';

@UseGuards(AgentOrSellerAuthGuard)
@Controller('property-repo')
export class PropertyRepoController {
  constructor(private readonly propertyRepoService: PropertyRepoService) {}

  @Get('all/property-documents/:propertyId')
  async getProperties(
    @Req() req: Request,
    @Res() res: Response,
    @Query() paginationDto: PaginationDto,
  ) {
    const propertyDocs = await this.propertyRepoService.getAllPropertyDocuments(
      req.user || req.agent,
      req.params.propertyId,
      paginationDto,
    );
    this._sendResponse({
      res,
      data: { ...propertyDocs },
      message: 'Property Documents Found',
    });
  }

  @Post('add/property-documents/:propertyId')
  async addToPropertyRepo(
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: CreatePropertyDocumentDto,
  ) {
    const propertyDocs = await this.propertyRepoService.addToPropertyRepo(
      req.user || req.agent,
      req.user ? 'User' : 'Agent',
      req.params.propertyId,
      dto,
    );
    this._sendResponse({
      res,
      data: propertyDocs,
      message: 'Property Documents Found',
    });
  }

  @Delete('delete/single/property-documents/:id')
  async deletePropertyDocument(@Req() req: Request, @Res() res: Response) {
    await this.propertyRepoService.deletePropertyDocument(
      req.user || req.agent,
      req.params.id,
    );
    this._sendResponse({
      res,
      data: {},
      message: 'Property Documents Deleted',
    });
  }

  // @Get('create-envelope')
  // async createEnvelope(
  //   @Query('email') email: string,
  //   @Query('name') name: string,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     const documentPath = './path/to/your/document.pdf'; // Adjust this path accordingly
  //     const envelopeId = await this.propertyRepoService.createEnvelope(
  //       email,
  //       name,
  //       documentPath,
  //     );
  //     const signingUrl = await this.propertyRepoService.getEmbeddedSigningUrl(
  //       envelopeId,
  //       email,
  //       name,
  //     );
  //     res.redirect(signingUrl);
  //   } catch (error) {
  //     res.status(500).send(error.message);
  //   }
  // }

  // @Get('callback')
  // callback(@Query('event') event: string, @Res() res: Response) {
  //   res.send('Signing complete: ' + event);
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
