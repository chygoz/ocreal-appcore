import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { DuplicateException } from 'src/custom_errors';
import { createUserJwtToken } from 'src/utils/jwt.util';
import { EmailService } from 'src/services/email/email.service';
import { CreateUserDto } from './dto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  async createUser(userId: string, userDto: CreateUserDto) {
    const userExists = await this.userModel.findById(userId);
    if (!userExists) {
      throw new BadRequestException('Account not found please sign up again.');
    }

    const payload = {
      ...userDto,
      fullname: `${userDto.firstname} ${userDto.lastname}`,
      password: crypto.createHash('md5').update(userDto.password).digest('hex'),
    };

    const user = await this.userModel.findByIdAndUpdate(userId, payload, {
      new: true,
    });

    const token = createUserJwtToken({
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: user.fullname,
      account_type: user.account_type,
    });
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

  async updateUserProfile(user: User, data: Partial<User>) {
    // if (data?.email) {
    //   const userExistis = await this.userModel.findOne({
    //     email: data.email.toLowerCase(),
    //   });

    //   if (userExistis)
    //     throw new DuplicateException(
    //       'An account with this email already exists',
    //     );
    // }

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
    const payload = { ...data };
    if (data?.firstname && data?.lastname) {
      payload['fullname'] = `${data.firstname} ${data.lastname}`;
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      user._id,
      payload,
    );

    return {
      updatedUser: {
        id: updatedUser!._id,
        email: updatedUser!.email,
        firstname: updatedUser!.firstname,
        lastname: updatedUser!.lastname,
        fullname: updatedUser!.fullname,
        account_type: updatedUser!.account_type,
      },
    };
  }

  async getUserProfile(userId: string): Promise<User> {
    return await this.userModel.findById(userId);
  }
}
