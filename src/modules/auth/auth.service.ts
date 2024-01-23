import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DuplicateException } from 'src/custom_errors';
import * as crypto from 'crypto';
import { EmailService } from 'src/services/email/email.service';
import { ForgotPasswordDto, LoginUserDto } from './dto/auth.dto';
import { User } from '../users/schema/user.schema';
import { configs } from 'src/configs';
import { Agent } from '../agent/schema/agent.schema';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
  ) {}

  async userLogin(loginDto: LoginUserDto) {
    const user = await this.userModel.findOne({
      email: loginDto.email,
      password: crypto
        .createHash('md5')
        .update(loginDto.password)
        .digest('hex'),
    });
    if (!user) throw new Error('Invalid email or password');

    const token = this._generateToken(
      {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        account_type: user.account_type,
      },
      configs.JWT_SECRET,
      10 * 24 * 60 * 60,
    );

    return {
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        account_type: user.account_type,
      },
      token,
    };
  }

  async sendUserVerificationEmail(emailDto: { email: string }): Promise<any> {
    const userExists = await this.userModel.findOne({ email: emailDto.email });
    if (userExists)
      throw new DuplicateException('An account with this email already exists');
    const user = await this.userModel.create({ email: emailDto.email });
    const token = this._generateToken(
      {
        email: emailDto.email,
        id: user.id,
      },
      configs.EMAIL_JWT_SECRET,
      10 * 24 * 60 * 60,
    );
    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Welcome to OCReal',
      template: 'welcome',
      body: {
        verificationLink: `${configs.BASE_URL}/auth/verify-email/${token}`,
      },
    });
    return;
  }

  async requestUserForgotPasswordToken(emailDto: {
    email: string;
  }): Promise<any> {
    const userExists = await this.userModel.findOne({ email: emailDto.email });
    if (!userExists)
      throw new DuplicateException('This account does not exist');

    const token = this._generateToken(
      {
        email: emailDto.email,
        id: userExists.id,
      },
      configs.JWT_FORGOTPASSWORD_SECRET,
      15 * 60,
    );
    console.log('TOKEN:   ', token);
    const decoded = this._decodeToken(token, configs.JWT_FORGOTPASSWORD_SECRET);
    console.log(decoded);
    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Password Reset Request',
      template: 'start_forgot_password',
      body: {
        resetPasswordLink: `${configs.BASE_URL}/auth/verify-email/${token}`,
        fullname: userExists.fullname,
      },
    });
    return;
  }

  async requestAgentForgotPasswordToken(emailDto: {
    email: string;
  }): Promise<any> {
    const agentExists = await this.agentModel.findOne({
      email: emailDto.email,
    });
    if (!agentExists)
      throw new DuplicateException('This account does not exist');

    const token = this._generateToken(
      {
        email: emailDto.email,
        id: agentExists.id,
      },
      configs.JWT_FORGOTPASSWORD_SECRET,
      15 * 60,
    );

    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Password Reset Request',
      template: 'start_forgot_password',
      body: {
        resetPasswordLink: `${configs.BASE_URL}/auth/verify-email/${token}`,
        fullname: agentExists.fullname,
      },
    });
    return;
  }

  async forgotUserPassword(
    userId: string,
    dto: ForgotPasswordDto,
  ): Promise<any> {
    const user = await this.userModel.findByIdAndUpdate(userId, {
      password: crypto.createHash('md5').update(dto.password).digest('hex'),
    });

    if (!user) throw new DuplicateException('Invalid token. Please try again');

    await this.emailService.sendEmail({
      email: user.email,
      subject: 'Password Changed!!!',
      template: 'password_changed',
      body: {
        fullname: user.fullname ? user.fullname : 'User',
      },
    });

    const token = this._generateToken(
      {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        account_type: user.account_type,
      },
      configs.JWT_SECRET,
      10 * 24 * 60 * 60,
    );

    return {
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        account_type: user.account_type,
      },
      token,
    };
  }

  async forgotAgentPassword(
    agentId: string,
    dto: ForgotPasswordDto,
  ): Promise<any> {
    const agent = await this.agentModel.findByIdAndUpdate(agentId, {
      password: crypto.createHash('md5').update(dto.password).digest('hex'),
    });
    if (!agent) throw new DuplicateException('Invalid token. Please try again');

    await this.emailService.sendEmail({
      email: agent.email,
      subject: 'Password Changed!!!',
      template: 'password_changed',
      body: {
        fullname: agent.fullname ? agent.fullname : 'User',
      },
    });

    const token = this._generateToken(
      {
        id: agent._id,
        email: agent.email,
        firstname: agent.firstname,
        lastname: agent.lastname,
        fullname: agent.fullname,
        licence_number: agent.licence_number,
        region: agent.region,
      },
      configs.JWT_AGENT_SECRET,
      10 * 24 * 60 * 60,
    );

    return {
      user: {
        id: agent._id,
        email: agent.email,
        firstname: agent.firstname,
        lastname: agent.lastname,
        fullname: agent.fullname,
        licence_number: agent.licence_number,
        region: agent.region,
      },
      token,
    };
  }

  async sendAgentVerificationEmail(emailDto: { email: string }): Promise<any> {
    const agentExistis = await this.agentModel.findOne({
      email: emailDto.email,
    });
    if (agentExistis)
      throw new DuplicateException('An account with this email already exists');
    const agent = await this.agentModel.create({ email: emailDto.email });

    const token = this._generateToken(
      {
        email: emailDto.email,
        id: agent.id,
      },
      configs.EMAIL_JWT_SECRET,
      10 * 24 * 60 * 60,
    );

    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Welcome to OCReal',
      template: 'welcome',
      body: {
        verificationLink: `${configs.BASE_URL}/auth/verify-email/${token}`,
      },
    });
    return;
  }

  async resendUserVerificationEmail(emailDto: { email: string }): Promise<any> {
    const user = await this.userModel.findOne({ email: emailDto.email });
    if (!user) throw new BadRequestException("User doesn't exist");
    await this.userModel.findOneAndUpdate({ email: emailDto.email });

    const token = this._generateToken(
      {
        email: emailDto.email,
        id: user.id,
      },
      configs.EMAIL_JWT_SECRET,
      10 * 24 * 60 * 60,
    );
    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Welcome to OCReal',
      template: 'welcome',
      body: {
        verificationLink: `${configs.BASE_URL}/auth/verify-email/${token}`,
      },
    });
    return;
  }

  async resendAgentVerificationEmail(emailDto: {
    email: string;
  }): Promise<any> {
    const agent = await this.agentModel.findOne({ email: emailDto.email });
    if (!agent) throw new BadRequestException("User doesn't exist");
    await this.agentModel.findOneAndUpdate({ email: emailDto.email });

    const token = this._generateToken(
      {
        email: emailDto.email,
        id: agent.id,
      },
      configs.EMAIL_JWT_SECRET,
      10 * 24 * 60 * 60,
    );

    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Welcome to OCReal',
      template: 'welcome',
      body: {
        verificationLink: `${configs.BASE_URL}/auth/verify-email/${token}`,
      },
    });
    return;
  }

  async verifyUserEmail(token: string): Promise<any> {
    const decodedToken: any = this._decodeToken(
      token,
      configs.EMAIL_JWT_SECRET,
    );
    if (!decodedToken)
      throw new UnauthorizedException('Verification link expired or invalid.');
    const user = await this.userModel.findById(decodedToken.id);

    if (!user) {
      throw new BadRequestException("User doesn't exist");
    }
    await this.userModel.findByIdAndUpdate(
      user.id,
      {
        emailVerified: true,
      },
      { new: true },
    );
    const loginToken = this._generateToken(
      {
        email: user.email,
        id: user.id,
      },
      configs.JWT_SECRET,
      10 * 24 * 60 * 60,
    );

    return {
      user: {
        id: user._id,
        email: user.email,
      },
      token: loginToken,
    };
  }

  async verifyAgentEmail(token: string): Promise<any> {
    const decodedToken: any = this._decodeToken(
      token,
      configs.EMAIL_JWT_SECRET,
    );

    if (!decodedToken)
      throw new UnauthorizedException('Verification link expired or invalid.');
    const agent = await this.agentModel.findById(decodedToken.id);

    if (!agent) {
      throw new BadRequestException("User doesn't exist");
    }
    await this.userModel.findByIdAndUpdate(
      agent.id,
      {
        emailVerified: true,
      },
      { new: true },
    );
    const loginToken = this._generateToken(
      {
        id: agent._id,
        email: agent.email,
      },
      configs.JWT_AGENT_SECRET,
      10 * 24 * 60 * 60,
    );

    return {
      agent: {
        id: agent._id,
        email: agent.email,
      },
      token: loginToken,
    };
  }

  private _generateToken(payload: any, secret: string, expiresIn: number) {
    return jwt.sign(payload, secret, {
      expiresIn,
    });
  }

  private _decodeToken(token: string, secret: string) {
    try {
      const data = jwt.verify(token, secret);
      return data;
    } catch (error) {
      return false;
    }
  }
}
