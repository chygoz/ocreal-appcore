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
import { AuthService } from './auth.service';
import {
  LoginUserDto,
  SendUserVerificationDto,
  VerifyForgotPasswordDto,
  VerifyUserEmail,
} from './dto/auth.dto';
import { ForgotPasswordJwtAuthGuard } from 'src/guards/forgotPassword.gaurd';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/user/send-verification')
  async sendUserVerificationEmail(
    @Body() sendEmailDto: SendUserVerificationDto,
    @Res() res: Response,
  ) {
    await this.authService.sendUserVerificationEmail(sendEmailDto);
    this._sendResponse({
      res,
      message: 'Email sent successfully',
    });
  }

  @UseGuards(ForgotPasswordJwtAuthGuard)
  @Put('/user/verify/forgot-password')
  async forgotUserPassword(
    @Body() forgotPasswordDto: VerifyForgotPasswordDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const data = await this.authService.forgotUserPassword(
      req.user.id,
      forgotPasswordDto,
    );
    return this._sendResponse({
      res,
      data,
      message: 'Password updated successfully',
    });
  }

  @Put('/user/start/forgot-password')
  async requestUserForgotPasswordToken(
    @Body() forgotPasswordDto: SendUserVerificationDto,
    @Res() res: Response,
  ) {
    await this.authService.requestUserForgotPasswordToken(forgotPasswordDto);
    return this._sendResponse({
      res,
      message: 'Password Reset Email successfully',
    });
  }

  @Put('/agent/start/forgot-password')
  async requestAgentForgotPasswordToken(
    @Body() forgotPasswordDto: SendUserVerificationDto,
    @Res() res: Response,
  ) {
    await this.authService.requestAgentForgotPasswordToken(forgotPasswordDto);
    return this._sendResponse({
      res,
      message: 'Password Reset Email successfully',
    });
  }

  @UseGuards(ForgotPasswordJwtAuthGuard)
  @Put('/agent/verify/forgot-password')
  async updateAgentPassword(
    @Body() forgotPasswordDto: VerifyForgotPasswordDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    await this.authService.forgotAgentPassword(req.agent.id, forgotPasswordDto);
    return this._sendResponse({
      res,
      message: 'Password updated successfully',
    });
  }

  @Post('/agent/resend-verification')
  async resendAgentVerificationEmail(
    @Body() sendEmailDto: SendUserVerificationDto,
    @Res() res: Response,
  ) {
    await this.authService.resendAgentVerificationEmail(sendEmailDto);
    return this._sendResponse({
      res,
      message: 'Email sent successfully',
    });
  }

  @Post('/user/verify-email')
  async verifyUserEmail(
    @Body() tokenDto: VerifyUserEmail,
    @Res() res: Response,
  ) {
    const data = await this.authService.verifyUserEmail(tokenDto.token);
    this._sendResponse({
      res,
      data,
      message: 'Email verification successfully',
    });
  }

  @Post('/agent/verify-email')
  async verifyAgentEmail(
    @Body() tokenDto: VerifyUserEmail,
    @Res() res: Response,
  ) {
    const data = await this.authService.verifyAgentEmail(tokenDto.token);
    this._sendResponse({
      res,
      data,
      message: 'Email verification successfully',
    });
  }

  @Post('/user/login')
  async userLogin(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    const data = await this.authService.userLogin(loginDto);
    this._sendResponse({
      res,
      data,
      message: 'User login successfully',
    });
  }

  @Post('/agent/send-verification')
  async sendUAgentVerificationEmail(
    @Body() sendEmailDto: SendUserVerificationDto,
    @Res() res: Response,
  ) {
    await this.authService.sendAgentVerificationEmail(sendEmailDto);
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
