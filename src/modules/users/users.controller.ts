import { JwtAuthGuard } from 'src/guards/auth-jwt.guard';
import { SendUserEverificationDto, UpdateUserDto } from '../auth/dto/user.dto';
import { UsersService } from './users.service';
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

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('/send-verification')
  async sendUserVerificationEmail(
    @Body() sendEmailDto: SendUserEverificationDto,
    @Res() res: Response,
  ) {
    await this.userService.sendUserVerificationEmail(sendEmailDto);
    this._sendResponse({
      res,
      message: 'Email sent successfully',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/profile/update')
  async updateProfile(
    @Body() profile: UpdateUserDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    await this.userService.updateUserProfile(req.user, profile);
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
