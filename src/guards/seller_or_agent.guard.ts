import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { decodeAgentJwtToken, decodeJwtToken } from 'src/utils/jwt.util';
import { User } from 'src/modules/users/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountTypeEnum } from 'src/constants';
import { Agent } from 'src/modules/agent/schema/agent.schema';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      active_user_role: AccountTypeEnum;
    }
  }
}
export class AgentOrSellerAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
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
    const decodedToken: any =
      decodeJwtToken(token) || decodeAgentJwtToken(token);
    if (!decodedToken) {
      throw new UnauthorizedException('Please login again.');
    }

    const user = await this.userModel.findById(decodedToken.id);

    if (user) {
      if (
        !request.headers.role ||
        !Object.values(AccountTypeEnum).includes(
          request.headers.role as AccountTypeEnum,
        )
      ) {
        throw new BadRequestException('Please provde an role in the header.');
      }
      request['user'] = user;
      request['active_user_role'] = request.headers
        .active_user_role as AccountTypeEnum;

      return true;
    }
    request['user'] = user;
    request['active_user_role'] = request.headers
      .active_user_role as AccountTypeEnum;

    const agent = await this.agentModel.findById(decodedToken.id);
    if (agent) {
      request['agent'] = agent;
      return true;
    }
    throw new UnauthorizedException('Invalid token. Please login again.');
  }
}
