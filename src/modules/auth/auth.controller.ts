import {
  Controller,
  Post,
  Body,
  Res,
  Put,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import {
  AccountSignUpDto,
  LoginUserDto,
  SendUserVerificationDto,
  UserUpdatePasswordDto,
  VerifyCode,
} from './dto/auth.dto';
import { JwtAgentAuthGuard } from 'src/guards/agent.guard';
import { JwtAuthGuard } from 'src/guards/auth-jwt.guard';
import { AuthGuard } from '@nestjs/passport';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const data = await this.authService.googleValidateUser(req.user);
    return this._sendResponse({
      res,
      data,
      message: 'Google login successfull',
    });
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async facebookLogin(@Req() req, @Res() res: Response): Promise<any> {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req, @Res() res: Response): Promise<any> {
    const data = await this.authService.facebookUserLogin(req.user);
    return this._sendResponse({
      res,
      data,
      message: 'Facebook login successfull',
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Post('/user/send-verification')
  async sendUserVerificationEmail(
    @Body() sendEmailDto: AccountSignUpDto,
    @Res() res: Response,
  ) {
    const data = await this.authService.sendUserVerificationEmail(sendEmailDto);
    this._sendResponse({
      res,
      data,
      message: 'Email sent successfully',
    });
  }

  @Post('/user/resend/code')
  async resendVerificationCode(
    @Body() sendEmailDto: SendUserVerificationDto,
    @Res() res: Response,
  ) {
    const data =
      await this.authService.resendUserVerificationEmail(sendEmailDto);
    this._sendResponse({
      res,
      data,
      message: 'Email sent successfully',
    });
  }

  @Post('/user/verify/code')
  async verifyUserCode(@Body() { code }: VerifyCode, @Res() res: Response) {
    const data = await this.authService.verifyUserCode(code);
    return this._sendResponse({
      res,
      data,
      message: 'Code Verified successfully',
    });
  }

  @Post('/agent/verify/code')
  async verifyAgentCode(@Body() { code }: VerifyCode, @Res() res: Response) {
    const data = await this.authService.verifyAgentCode(code);
    return this._sendResponse({
      res,
      data,
      message: 'Code Verified successfully',
    });
  }

  @Put('/user/forgot-password')
  async userForgotPassword(
    @Body() forgotPasswordDto: SendUserVerificationDto,
    @Res() res: Response,
  ) {
    const data = await this.authService.userForgotPassword(forgotPasswordDto);
    return this._sendResponse({
      res,
      message: 'Password Reset Email Sent successfully',
      data,
    });
  }

  @Put('/agent/forgot-password')
  async agentForgotPassword(
    @Body() forgotPasswordDto: SendUserVerificationDto,
    @Res() res: Response,
  ) {
    const data = await this.authService.agentForgotPassword(forgotPasswordDto);
    return this._sendResponse({
      res,
      message: 'Password Reset Email Sent successfully',
      data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/user/update/password')
  async updateUserPassword(
    @Body() passwordDto: UserUpdatePasswordDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const data = await this.authService.updateUserPassword(
      req.user.id,
      passwordDto,
    );
    return this._sendResponse({
      res,
      message: 'Password Updated successfully',
      data,
    });
  }

  @UseGuards(JwtAgentAuthGuard)
  @Put('/agent/update/password')
  async updateAgentPassword(
    @Body() passwordDto: UserUpdatePasswordDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const data = await this.authService.updateAgentPassword(
      req.agent.id,
      passwordDto,
    );
    return this._sendResponse({
      res,
      message: 'Password Updated successfully',
      data,
    });
  }

  // @Put('/agent/start/forgot-password')
  // async requestAgentForgotPasswordToken(
  //   @Body() forgotPasswordDto: SendUserVerificationDto,
  //   @Res() res: Response,
  // ) {
  //   await this.authService.requestAgentForgotPasswordToken(forgotPasswordDto);
  //   return this._sendResponse({
  //     res,
  //     message: 'Password Reset Email successfully',
  //   });
  // }

  @Post('/agent/resend-verification')
  async resendAgentVerificationEmail(
    @Body() sendEmailDto: SendUserVerificationDto,
    @Res() res: Response,
  ) {
    const data =
      await this.authService.resendAgentVerificationEmail(sendEmailDto);
    return this._sendResponse({
      res,
      message: 'Email sent successfully',
      data,
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

  @Post('/agent/login')
  async agentLogin(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    const data = await this.authService.agentLogin(loginDto);
    this._sendResponse({
      res,
      data,
      message: 'login successfully',
    });
  }

  @Post('/agent/send-verification')
  async sendUAgentVerificationEmail(
    @Body() sendEmailDto: SendUserVerificationDto,
    @Res() res: Response,
  ) {
    const data =
      await this.authService.sendAgentVerificationEmail(sendEmailDto);
    this._sendResponse({
      res,
      message: 'Email sent successfully',
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
    };
    const status_code = statusCode ? statusCode : 200;
    res.status(status_code).json(responseData);
  }
}
