import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/modules/users/schema/user.schema';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { decodeJwtToken } from 'src/utils/jwt.util';

@Injectable()
export class SocketGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const { authorization } = client.handshake.headers;

    if (!authorization) {
      throw new WsException('Authorization token is missing.');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new WsException('Invalid authorization format.');
    }

    const decodedToken: any = decodeJwtToken(token);
    if (!decodedToken) {
      throw new WsException('Invalid or expired token.');
    }

    // Check for user or agent
    const user = await this.userModel.findById(decodedToken.id);
    if (user) {
      client.handshake.user = user;
      return true;
    }

    const agent = await this.agentModel.findById(decodedToken.id);
    if (agent) {
      client.handshake.agent = agent;
      return true;
    }

    throw new WsException('Unauthorized: User or Agent not found.');
  }
}
