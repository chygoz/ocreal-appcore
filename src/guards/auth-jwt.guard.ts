import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { decodeJwtToken } from 'src/utils/jwt.util';
import { User } from 'src/modules/users/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountTypeEnum } from 'src/constants';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      active_user_role: AccountTypeEnum;
    }
  }
}
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    return this.validateRequest(request);
  }

  async validateRequest(request: Request): Promise<boolean> {
    if (!request.headers.authorization) {
      throw new BadRequestException(
        'Please provde bearer token in authorization header.',
      );
    }
    if (!request.headers.role) {
      throw new BadRequestException('Please provide an role in the header.');
    }
    const inclduded = Object.values(AccountTypeEnum).includes(
      request.headers.role as AccountTypeEnum,
    );
    if (!inclduded) {
      throw new BadRequestException(
        'Please provide a valid user role as role in the header.',
      );
    }
    const token = request.headers.authorization.split(' ')[1];

    if (!token) {
      throw new BadRequestException(
        'Please provde bearer token in authorization header.',
      );
    }

    const decodedToken: any = decodeJwtToken(token);
    if (!decodedToken) {
      throw new UnauthorizedException('Please login again.');
    }

    const user = await this.userModel.findById(decodedToken.id);

    if (!user) {
      throw new UnauthorizedException('Invalid token. Please login again.');
    }
    request['user'] = user;
    request['active_user_role'] = request.headers
      .active_user_role as AccountTypeEnum;

    return true;
  }
}
