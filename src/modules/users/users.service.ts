import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';
import { DuplicateException } from 'src/custom_errors';
import { configs } from '../../configs/index';
import {
  createEmailJwtToken,
  createJwtToken,
  decodeEmailJwtToken,
} from 'src/utils/jwt.util';
import { EmailService } from 'src/services/email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  async sendUserVerificationEmail(emailDto: { email: string }): Promise<any> {
    const userExists = await this.userModel.findOne({ email: emailDto.email });
    if (userExists) throw new DuplicateException();
    await this.userModel.create({ email: emailDto.email });
    const token = createEmailJwtToken({
      email: emailDto.email,
      id: userExists.id,
    });
    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Welcome to OCReal',
      body: `${configs.BASE_URL}/auth/verify-email/${token}`,
    });
    return;
  }

  async resendVerificationEmail(emailDto: { email: string }): Promise<any> {
    const user = await this.userModel.findOne({ email: emailDto.email });
    await this.userModel.findOneAndUpdate({ email: emailDto.email });
    const token = createEmailJwtToken({ email: emailDto.email, id: user.id });
    await this.emailService.sendEmail({
      email: emailDto.email,
      subject: 'Welcome to OCReal',
      body: `${configs.BASE_URL}/auth/verify-email/${token}`,
    });
    return;
  }

  async verifyEmail(token: string): Promise<any> {
    const decodedToken: any = decodeEmailJwtToken(token);
    if (!decodedToken)
      throw new UnauthorizedException('Verification link expired or invalid.');
    const user = await this.userModel.findById(decodedToken.id);
    if (!user) throw new UnauthorizedException();
    await this.userModel.findByIdAndUpdate(
      user.id,
      {
        emailVerified: true,
      },
      { new: true },
    );
    return;
  }

  async updateUserProfile(user: User, data: Partial<User>) {
    if (data?.email) {
      const userExistis = await this.userModel.findOne({
        email: data.email.toLowerCase(),
      });

      if (userExistis)
        throw new DuplicateException(
          'An account with this email already exists',
        );
    }
    if (data?.mobile) {
      const userExistis = await this.userModel.findOne({
        'mobile.raw_mobile': data.mobile.raw_mobile,
      });
      if (userExistis)
        throw new DuplicateException(
          'An account with this mobile already exists',
        );
    }
    //TODO: Perform any notification actions here

    const updatedUser = await this.userModel.findByIdAndUpdate(user._id, data);

    const token = createJwtToken(updatedUser!);

    return {
      user: {
        id: updatedUser!._id,
        email: updatedUser!.email,
        firstname: updatedUser!.firstname,
        lastname: updatedUser!.lastname,
        fullname: updatedUser!.fullname,
        account_type: updatedUser!.account_type,
      },
      token,
    };
  }

  async getUserProfile(userId: string): Promise<User> {
    return await this.userModel.findById(userId);
  }
}
