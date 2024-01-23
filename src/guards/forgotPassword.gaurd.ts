import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { User } from 'src/modules/users/schema/user.schema';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import * as jwt from 'jsonwebtoken';
import { configs } from 'src/configs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/services/email/email.service';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      agent: Agent;
    }
  }
}
export class ForgotPasswordJwtAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
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

    const token = request.headers?.authorization?.split(' ')[1];

    if (!token) {
      throw new BadRequestException(
        'Please provde bearer token in authorization header.',
      );
    }

    const decodedToken: any = this._decodeToken(
      token,
      configs.JWT_FORGOTPASSWORD_SECRET,
    );
    if (!decodedToken) {
      throw new UnauthorizedException('Invalid Verification Token');
    }

    const user = await this.userModel.findById(decodedToken.id);

    if (user) {
      request['user'] = user;
      return true;
    }
    const agent = await this.agentModel.findById(decodedToken.id);
    if (agent) {
      request['agent'] = agent;
      return true;
    }
    throw new UnauthorizedException('Invalid token. Please try again.');
  }

  private _decodeToken(token: string, secret: string) {
    try {
      const data = jwt.verify(token, secret);
      return data;
    } catch (error) {
      return false;
    }
  }
}
