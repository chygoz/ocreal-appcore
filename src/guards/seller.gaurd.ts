import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { AccountTypeEnum } from 'src/constants';

export class SellerAuthGuard implements CanActivate {
  constructor() {}
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

    if (request.headers?.role !== AccountTypeEnum.SELLER) {
      throw new BadRequestException(
        'This user role can not perform this action.',
      );
    }
    return true;
  }
}
