import { JwtAuthGuard } from 'src/guards/auth-jwt.guard';
import { UsersService } from './users.service';
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
  Delete,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateUserDto, UpdateUserDto } from './dto';
import { SaveUserDocumentsDto } from './dto/saveDocuments.dto';
import { PaginationDto } from 'src/constants/pagination.dto';
import { PropertyPreferenceDto } from './dto/propertyPreference.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/onboard-user')
  async onBoardNewuser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<any> {
    const data = await this.userService.onBoardNewuser(
      req.user.id,
      createUserDto,
    );
    this._sendResponse({
      res,
      data,
      message: 'Email sent successfully',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/save/property-preference')
  async savedUserPropertyPreference(
    @Body() dto: PropertyPreferenceDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<any> {
    const data = await this.userService.savedUserPropertyPreference(
      req.user,
      dto,
    );
    this._sendResponse({
      res,
      data,
      message: 'User property preference updated',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/complete/property-preference')
  async completeUserPropertyPreference(
    @Body() dto: PropertyPreferenceDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<any> {
    const data = await this.userService.completeUserPropertyPreference(
      req.user,
      dto,
    );
    this._sendResponse({
      res,
      data,
      message: 'User property preference saved',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/save/user-documents')
  async saveUserDocuments(
    @Body() dto: SaveUserDocumentsDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<any> {
    const data = await this.userService.saveUserDocuments(req.user, dto);
    this._sendResponse({
      res,
      data,
      message: 'User Documents Saved',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('get/user-documents')
  async getUserDocuments(
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<any> {
    const data = await this.userService.getUserDocuments(
      req.user,
      paginationDto,
    );
    this._sendResponse({
      res,
      data,
      message: 'User Documents Found',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/user-document/:id')
  async deleteUserDocuments(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<any> {
    await this.userService.deleteUserDocuments(req.user, req.params.id);
    this._sendResponse({
      res,
      data: {},
      message: 'Document Deleted',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update/profile')
  async updateUserProfile(
    @Body() profile: UpdateUserDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const data = await this.userService.updateUserProfile(req.user, profile);
    this._sendResponse({
      res,
      data,
      message: 'Profile update successfully',
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
