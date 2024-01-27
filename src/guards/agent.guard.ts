import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { decodeAgentJwtToken } from 'src/utils/jwt.util';
import { Reflector } from '@nestjs/core';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      agent: Agent;
    }
  }
}
export class JwtAgentAuthGuard implements CanActivate {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
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

    const decodedToken: any = decodeAgentJwtToken(token);

    if (!decodedToken) {
      throw new UnauthorizedException('Please login again.');
    }

    const agent = await this.agentModel.findById(decodedToken.id);

    if (!agent) {
      throw new UnauthorizedException('Invalid token. Please login again.');
    }
    request['agent'] = agent;
    return true;
  }
}
