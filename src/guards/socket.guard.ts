import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountTypeEnum } from 'src/constants';
import { User } from 'src/modules/users/schema/user.schema';
import { decodeJwtToken, decodeAgentJwtToken } from 'src/utils/jwt.util';

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

@Injectable()
export class SocketGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToWs().getClient().handshake;

    const token = request.headers.authorization?.split(' ')[1];

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
      // if (
      //   !request.headers.active_user_role ||
      //   !Object.values(AccountTypeEnum).includes(
      //     request.headers.active_user_role as AccountTypeEnum,
      //   )
      // ) {
      //   throw new BadRequestException(
      //     'Please provde an active_user_role in the header.',
      //   );
      // }
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

  // async validateRequest(request: Request): Promise<boolean> {
  //   if (!request.headers.authorization) {
  //     throw new BadRequestException(
  //       'Please provde bearer token in authorization header.',
  //     );
  //   }

  //   const token = request.headers.authorization.split(' ')[1];

  //   if (!token) {
  //     throw new BadRequestException(
  //       'Please provde bearer token in authorization header.',
  //     );
  //   }
  //   const decodedToken: any =
  //     decodeJwtToken(token) || decodeAgentJwtToken(token);
  //   if (!decodedToken) {
  //     throw new UnauthorizedException('Please login again.');
  //   }

  //   const user = await this.userModel.findById(decodedToken.id);

  //   if (user) {
  //     if (
  //       !request.headers.active_user_role ||
  //       !Object.values(AccountTypeEnum).includes(
  //         request.headers.active_user_role as AccountTypeEnum,
  //       )
  //     ) {
  //       throw new BadRequestException(
  //         'Please provde an active_user_role in the header.',
  //       );
  //     }
  //     request['user'] = user;
  //     request['active_user_role'] = request.headers
  //       .active_user_role as AccountTypeEnum;

  //     return true;
  //   }
  //   request['user'] = user;
  //   request['active_user_role'] = request.headers
  //     .active_user_role as AccountTypeEnum;

  //   const agent = await this.agentModel.findById(decodedToken.id);
  //   if (agent) {
  //     request['agent'] = agent;
  //     return true;
  //   }
  //   throw new UnauthorizedException('Invalid token. Please login again.');
  // }
}
