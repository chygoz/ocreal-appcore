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
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateUserDto, UpdateUserDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('/onboard-user')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<any> {
    const data = await this.userService.createUser(req.user.id, createUserDto);
    this._sendResponse({
      res,
      data,
      message: 'Email sent successfully',
    });
  }

  // @Post('/onboard-user')
  // async updateUserPassword(
  //   @Body() createUserDto: UserUpdatePasswordDto,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   const data = await this.userService.createUser(createUserDto);
  //   this._sendResponse({
  //     res,
  //     data,
  //     message: 'Email sent successfully',
  //   });
  // }

  @Put('/profile/update')
  async updateProfile(
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
    const statsu_code = statusCode ? statusCode : 200;
    res.status(statsu_code).json(responseData);
  }
}