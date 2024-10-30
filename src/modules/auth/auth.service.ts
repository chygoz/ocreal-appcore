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
import { UpdatePasswordDto, LoginUserDto } from './dto/auth.dto';
import { User } from '../users/schema/user.schema';
import { configs } from 'src/configs';
import { Agent } from '../agent/schema/agent.schema';
import * as jwt from 'jsonwebtoken';
import { verificationTokenGen } from 'src/utils/randome-generators';
import * as moment from 'moment';
import { createAgentJwtToken } from 'src/utils/jwt.util';
import { AccountTypeEnum } from 'src/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
  ) {}

  async googleUserLogin(req) {
    if (!req?.user) {
      throw new BadRequestException('No user from google');
    }
    const data = req.user.user;
    console.log(data, 'DATA FROM GOOGLE');
    const user = await this.userModel.findOne({
      email: data.email,
    });
    if (!user) {
      const newUser = await this.userModel.create({
        email: data.email,
        firstname: data.firstName,
        lastname: data.lastName,
        account_type: AccountTypeEnum.BUYER,
        emailVerified: true,
      });
      const savedUser = await newUser.save();
      const token = this._generateToken(
        {
          id: savedUser._id,
          email: savedUser.email,
          firstname: savedUser.firstname,
          lastname: savedUser.lastname,
          fullname: savedUser.fullname,
          account_type: savedUser.account_type,
          emailVerified: savedUser.emailVerified,
          preApproval: savedUser.preApproval,
        },
        configs.JWT_SECRET,
        10 * 24 * 60 * 60,
      );

      return {
        user: {
          id: savedUser._id,
          email: savedUser.email,
          firstname: savedUser.firstname,
          lastname: savedUser.lastname,
          fullname: savedUser.fullname,
          account_type: savedUser.account_type,
          preApproval: savedUser.preApproval,
        },
        token,
      };
    }
    const token = this._generateToken(
      {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        account_type: user.account_type,
        emailVerified: user.emailVerified,
        preApproval: user.preApproval,
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
        preApproval: user.preApproval,
      },
      token,
    };
  }

  async facebookUserLogin(facebookUser: any) {
    if (!facebookUser) {
      throw new BadRequestException('No user from facebook');
    }
    const data = facebookUser.user;

    const user = await this.userModel.findOne({
      facebookId: data.id,
    });
    if (!user) {
      const newUser = await this.userModel.create({
        email: data?.email,
        firstname: data.firstName,
        lastname: data.lastName,
        fullname: data.firstName + ' ' + data.lastName,
        facebookId: data.id,
      });
      const savedUser = await newUser.save();
      const token = this._generateToken(
        {
          id: savedUser._id,
          email: savedUser?.email,
          firstname: savedUser.firstname,
          lastname: savedUser.lastname,
          fullname: savedUser.fullname,
          account_type: savedUser?.account_type,
          emailVerified: savedUser.emailVerified,
          preApproval: savedUser.preApproval,
        },
        configs.JWT_SECRET,
        10 * 24 * 60 * 60,
      );

      return {
        user: {
          id: savedUser._id,
          email: savedUser.email,
          firstname: savedUser.firstname,
          lastname: savedUser.lastname,
          fullname: savedUser.fullname,
          account_type: savedUser?.account_type,
          preApproval: savedUser.preApproval,
        },
        token,
      };
    }
    const token = this._generateToken(
      {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        account_type: user?.account_type,
        emailVerified: user?.emailVerified,
        preApproval: user.preApproval,
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
        account_type: user?.account_type,
        preApproval: user?.preApproval,
      },
      token,
    };
  }

  async userLogin(loginDto: LoginUserDto) {
    const user = await this.userModel.findOne({
      email: loginDto.email,
      password: crypto
        .createHash('md5')
        .update(loginDto.password)
        .digest('hex'),
    });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const token = this._generateToken(
      {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        account_type: user.account_type,
        emailVerified: user.emailVerified,
        preApproval: user.preApproval,
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
        preApproval: user.preApproval,
        propertyPreference: user.propertyPreference,
      },
      token,
    };
  }

  async agentLogin(loginDto: LoginUserDto) {
    const user = await this.agentModel.findOne({
      email: loginDto.email,
      password: crypto
        .createHash('md5')
        .update(loginDto.password)
        .digest('hex'),
    });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const token = createAgentJwtToken({
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: user.fullname,
      emailVerified: user.emailVerified,
      region: user?.region,
      licence_number: user?.licence_number,
      avatar: user?.avatar,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        region: user.region,
        licence_number: user.licence_number,
        avatar: user.avatar,
      },
      token,
    };
  }

  async sendUserVerificationEmail(emailDto: { email: string }): Promise<any> {
    const userExists = await this.userModel.findOne({ email: emailDto.email });
    if (userExists)
      throw new DuplicateException('An account with this email already exists');
    const token = await this._generateUserEmailToken();
    await this.userModel.create({
      email: emailDto.email,
      verification_code: token,
      token_expiry_time: moment().add(10, 'minutes').toDate(),
    });
    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Welcome to OCReal',
      template: 'welcome',
      body: {
        verificationCode: token,
        fullname: 'User',
      },
    });
    return { token };
  }

  async googleValidateUser(user: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
  }) {
    const userExists = await this.userModel.findOne({ email: user.email });
    if (userExists) {
      const token = this._generateToken(
        {
          id: userExists._id,
          email: userExists.email,
          firstname: userExists.firstname,
          lastname: userExists.lastname,
          fullname: userExists.fullname,
          account_type: userExists.account_type,
          emailVerified: userExists.emailVerified,
          preApproval: userExists.preApproval,
        },
        configs.JWT_SECRET,
        10 * 24 * 60 * 60,
      );

      return {
        user: {
          id: userExists._id,
          email: userExists.email,
          firstname: userExists.firstname,
          lastname: userExists.lastname,
          fullname: userExists.fullname,
          account_type: userExists.account_type,
          preApproval: userExists.preApproval,
        },
        token,
      };
    }
  }

  async userForgotPassword(emailDto: { email: string }): Promise<any> {
    const userExists = await this.userModel.findOne({ email: emailDto.email });
    if (!userExists)
      throw new DuplicateException('This account does not exist');
    const token = await this._generateUserEmailToken();
    await this.userModel.findByIdAndUpdate(userExists.id, {
      verification_code: token,
      token_expiry_time: moment().add(10, 'minutes').toDate(),
    });
    const email = emailDto.email;
    await this.emailService.sendEmail({
      email: email,
      subject: 'Password Reset Request',
      template: 'forgot_password',
      body: {
        verificationCode: token,
        fullname: userExists.fullname,
      },
    });
    return {
      token,
    };
  }

  async agentForgotPassword(emailDto: { email: string }): Promise<any> {
    const agentExists = await this.agentModel.findOne({
      email: emailDto.email,
    });
    if (!agentExists)
      throw new DuplicateException('This account does not exist');
    const token = await this._generateAgentEmailToken();
    await this.agentModel.findByIdAndUpdate(agentExists.id, {
      verification_code: token,
      token_expiry_time: moment().add(10, 'minutes').toDate(),
    });
    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Password Reset Request',
      template: 'forgot_password',
      body: {
        verificationCode: token,
        fullname: agentExists.fullname,
      },
    });
    return {
      token,
    };
  }

  async verifyUserCode(code: string) {
    const userExists = await this.userModel.findOne({
      verification_code: code,
      token_expiry_time: { $gte: moment().toDate() },
    });
    if (!userExists) {
      throw new DuplicateException('Invalid or expired code');
    }

    await this.userModel.findByIdAndUpdate(userExists.id, {
      verification_code: '',
      token_expiry_time: null,
      emailVerified: true,
    });
    const token = this._generateToken(
      {
        id: userExists._id,
        email: userExists.email,
        firstname: userExists.firstname,
        lastname: userExists.lastname,
        fullname: userExists.fullname,
        account_type: userExists.account_type,
        emailVerified: userExists.emailVerified,
      },
      configs.JWT_SECRET,
      10 * 24 * 60 * 60,
    );
    return {
      token,
    };
  }

  async updateUserPassword(
    userId: string,
    dto: UpdatePasswordDto,
  ): Promise<any> {
    const user = await this.userModel.findByIdAndUpdate(userId, {
      password: crypto.createHash('md5').update(dto.password).digest('hex'),
    });
    if (!user) throw new DuplicateException('Invalid token. Please try again');

    await this.emailService.sendEmail({
      email: user.email,
      subject: 'Password Changed!!!',
      template: 'password-update',
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

  async updateAgentPassword(
    userId: string,
    dto: UpdatePasswordDto,
  ): Promise<any> {
    const agent = await this.agentModel.findByIdAndUpdate(userId, {
      password: crypto.createHash('md5').update(dto.password).digest('hex'),
    });
    if (!agent) throw new DuplicateException('Invalid token. Please try again');

    await this.emailService.sendEmail({
      email: agent.email,
      subject: 'Password Changed!!!',
      template: 'password-update',
      body: {
        fullname: agent.fullname ? agent.fullname : 'User',
      },
    });

    const token = createAgentJwtToken({
      id: agent.id,
      email: agent.email,
      firstname: agent.firstname,
      lastname: agent.lastname,
      fullname: agent.fullname,
      emailVerified: agent.emailVerified,
      region: agent.region,
      licence_number: agent.licence_number,
    });

    return {
      user: {
        id: agent.id,
        email: agent.email,
        firstname: agent.firstname,
        lastname: agent.lastname,
        fullname: agent.fullname,
        region: agent.region,
        licence_number: agent.licence_number,
      },
      token,
    };
  }

  async verifyAgentCode(code: string) {
    const agentExistis = await this.agentModel.findOne({
      verification_code: code,
      token_expiry_time: { $gte: moment().toDate() },
    });
    if (!agentExistis) {
      throw new DuplicateException('Invalid or expired code');
    }

    await this.agentModel.findByIdAndUpdate(agentExistis.id, {
      verification_code: '',
      token_expiry_time: null,
      emailVerified: true,
    });

    const token = createAgentJwtToken({
      email: agentExistis.email,
      id: agentExistis.id,
    });
    return {
      token,
    };
  }

  async forgotAgentPassword(
    agentId: string,
    dto: UpdatePasswordDto,
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
    const token = await this._generateAgentEmailToken();
    await this.agentModel.create({
      email: emailDto.email,
      verification_code: token,
      token_expiry_time: moment().add(10, 'minutes').toDate(),
    });
    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Welcome to OCReal',
      template: 'welcome',
      body: {
        verificationCode: token,
        fullname: 'User',
      },
    });
    return { token };
  }

  async resendUserVerificationEmail({ email }): Promise<any> {
    const user = await this.userModel.findOne({ email });
    console.log(user, '  ::: THE DTO   :::');
    if (!user) throw new BadRequestException("User doesn't exist");
    const token = await this._generateUserEmailToken();
    await this.userModel.findByIdAndUpdate(user.id, {
      email: email,
      verification_code: token,
      token_expiry_time: moment().add(10, 'minutes').toDate(),
    });
    await this.emailService.sendEmail({
      email: email,
      subject: 'Welcome to OCReal',
      template: 'resend_code',
      body: {
        verificationCode: token,
        fullname: user.fullname || 'User',
      },
    });
    return {
      token,
    };
  }

  async resendAgentVerificationEmail(emailDto: {
    email: string;
  }): Promise<any> {
    const agent = await this.agentModel.findOne({ email: emailDto.email });
    if (!agent) throw new BadRequestException("User doesn't exist");

    const token = await this._generateAgentEmailToken();
    await this.agentModel.findByIdAndUpdate(agent.id, {
      email: emailDto.email,
      verification_code: token,
      token_expiry_time: moment().add(10, 'minutes').toDate(),
    });
    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Welcome to OCReal',
      template: 'resend_code',
      body: {
        verificationCode: token,
        fullname: agent.fullname || 'User',
      },
    });
    return { token };
  }

  private _generateToken(payload: any, secret: string, expiresIn: number) {
    return jwt.sign(payload, secret, {
      expiresIn,
    });
  }

  private async _generateUserEmailToken(): Promise<string> {
    let token: undefined | string = undefined;
    while (!token) {
      token = verificationTokenGen(6);
      const tokenExists = await this.userModel.findOne({
        verification_code: token,
        token_expiry_time: { $gte: moment().toDate() },
      });
      if (tokenExists) {
        token = undefined;
      }
    }
    return token;
  }
  private async _generateAgentEmailToken(): Promise<string> {
    let token: undefined | string = undefined;
    while (!token) {
      token = verificationTokenGen(6);
      const tokenExists = await this.agentModel.findOne({
        verification_code: token,
        token_expiry_time: { $gte: moment().toDate() },
      });
      if (tokenExists) {
        token = undefined;
      }
    }
    return token;
  }
}
