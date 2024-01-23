import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { decodeJwtToken } from 'src/utils/jwt.util';
import { Reflector } from '@nestjs/core';
import { User } from 'src/modules/users/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private reflector: Reflector,
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
    return true;
  }
}
