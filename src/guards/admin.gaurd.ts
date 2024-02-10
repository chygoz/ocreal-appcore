import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { User } from 'src/modules/users/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { configs } from 'src/configs';

export class AdminGuard implements CanActivate {
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
    const x_api_key = request.headers['x_api_key'];
    const key = x_api_key ? (x_api_key as string).split(' ')[1] : undefined;
    if (!key || key !== configs.ADMIN_API_KEY) {
      throw new UnauthorizedException(
        'Please provde a valid admin api key your request header.',
      );
    }
    return true;
  }
}
