import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DuplicateException } from 'src/custom_errors';
import crypto from 'crypto';
import { createJwtToken } from 'src/utils/jwt.util';
import { AccountTypeEnum } from 'src/constants';
import { EmailService } from 'src/services/email/email.service';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { User } from '../users/user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  async createUser(userDto: CreateUserDto) {
    const phoneNumberExists = await this.userModel.findOne({
      $or: [{ 'mobile.raw_mobile': userDto.mobile.raw_mobile }],
    });
    if (phoneNumberExists.account_type != AccountTypeEnum.AGENT) {
      throw new DuplicateException('Phone number exists');
    }
    const payload = {
      ...userDto,
      password: crypto.createHash('md5').update(userDto.password).digest('hex'),
      email: undefined,
    };
    const user = await this.userModel.findOneAndUpdate(
      { email: userDto.email },
      payload,
      { new: true },
    );
    const token = createJwtToken({
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: user.fullname,
      account_type: user.account_type,
      licence_number: user.licence_number,
    });
    return {
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        account_type: user.account_type,
        licence_number: user.licence_number,
      },
      token,
    };
  }

  async login(loginDto: LoginUserDto) {
    const user = await this.userModel.findOne(
      {
        email: loginDto.email,
        password: crypto
          .createHash('md5')
          .update(loginDto.password)
          .digest('hex'),
      },
      {
        projection: '-password',
      },
    );
    if (!user) throw new Error('User not found');
    const token = createJwtToken({
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: user.fullname,
      account_type: user.account_type,
      licence_number: user.licence_number,
    });
    return {
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        account_type: user.account_type,
        licence_number: user.licence_number,
      },
      token,
    };
  }
}
