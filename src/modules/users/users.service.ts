import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { DuplicateException } from 'src/custom_errors';
import { createUserJwtToken } from 'src/utils/jwt.util';
import { EmailService } from 'src/services/email/email.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as crypto from 'crypto';
import { UpdatePasswordDto } from '../auth/dto/auth.dto';
import * as jwt from 'jsonwebtoken';
import { configs } from 'src/configs';
import { SaveUserDocumentsDto } from './dto/saveDocuments.dto';
import { UserDocument } from './schema/user_documents';
import { PaginationDto } from 'src/constants/pagination.dto';
import { PropertyPreferenceDto } from './dto/propertyPreference.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserDocument.name)
    private readonly userDocumentModel: Model<UserDocument>,
    private readonly emailService: EmailService,
  ) {}

  async onBoardNewuser(userId: string, userDto: CreateUserDto) {
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

  async saveUserDocuments(user: User, dto: SaveUserDocumentsDto) {
    const docs = dto.documents.map((x: any) => {
      return {
        ...x,
        user: user._id,
      };
    });
    const documents = await this.userDocumentModel.insertMany(docs);
    return documents;
  }

  async savedUserPropertyPreference(user: User, dto: PropertyPreferenceDto) {
    return await this.userModel.findByIdAndUpdate(
      user.id,
      {
        propertyPreference: dto,
      },
      {
        new: true,
      },
    );
  }

  async completeUserPropertyPreference(user: User, dto: PropertyPreferenceDto) {
    return await this.userModel.findByIdAndUpdate(
      user.id,
      {
        propertyPreference: { ...dto, onboardingCompleted: true },
      },
      {
        new: true,
      },
    );
  }

  async deleteUserDocuments(user: User, id: string) {
    await this.userDocumentModel.findByIdAndDelete(id);
    return true;
  }

  async getUserDocuments(user: User, paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;
    const query: any = {};
    if (search) {
      query['$or'] = [
        {
          name: new RegExp(new RegExp(search, 'i'), 'i'),
        },
        {
          documentType: new RegExp(new RegExp(search, 'i'), 'i'),
        },
      ];
    }
    const queryObject = search
      ? { ...query, user: user._id }
      : { user: user._id };
    console.log(queryObject);
    const [result, total] = await Promise.all([
      this.userDocumentModel.find(queryObject).skip(skip).limit(limit).exec(),
      this.userDocumentModel.countDocuments(queryObject),
    ]);

    return { result, total, page, limit };
  }
  async updateUserProfile(user: User, data: UpdateUserDto) {
    if (data?.mobile) {
      const userExistis = await this.userModel.findOne({
        'mobile.raw_mobile': data.mobile.raw_mobile,
      });
      if (userExistis)
        throw new DuplicateException(
          'An account with this mobile already exists',
        );
    }
    const payload = { ...data };
    if (data?.firstname && !data?.lastname) {
      payload['fullname'] = `${data.firstname} ${user.lastname}`;
    }
    if (!data?.firstname && data?.lastname) {
      payload['fullname'] = `${user.firstname} ${data.lastname}`;
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      user.id,
      payload,
    );
    return {
      updatedUser: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        firstname: updatedUser!.firstname,
        lastname: updatedUser!.lastname,
        fullname: updatedUser!.fullname,
        account_type: updatedUser!.account_type,
        preApproval: updatedUser.preApproval,
        preApprovalDocument: updatedUser.preApprovalDocument,
      },
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

    // await this.emailService.sendEmail({
    //   email: user.email,
    //   subject: 'Password Changed!!!',
    //   template: 'password-update',
    //   body: {
    //     fullname: user.fullname ? user.fullname : 'User',
    //   },
    // });

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

  async getUserProfile(userId: string): Promise<User> {
    return await this.userModel.findById(userId);
  }

  private _generateToken(payload: any, secret: string, expiresIn: number) {
    return jwt.sign(payload, secret, {
      expiresIn,
    });
  }
}
