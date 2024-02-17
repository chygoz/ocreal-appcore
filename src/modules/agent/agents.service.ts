import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DuplicateException } from 'src/custom_errors';
import { createAgentJwtToken } from 'src/utils/jwt.util';
import { EmailService } from 'src/services/email/email.service';
import { Agent } from './schema/agent.schema';
import { InviteAgentDto, OnboardAgentDto } from './dto';
import * as crypto from 'crypto';
import { PaginationDto } from '../../constants/pagination.dto';

import { configs } from 'src/configs';
import { Property } from '../property/schema/property.schema';
import { User } from '../users/schema/user.schema';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
    @InjectModel(Property.name) private readonly propertyModel: Model<Property>,
    private readonly emailService: EmailService,
  ) {}

  async onboardAgent(agentId: string, agentDto: OnboardAgentDto) {
    const agentExists = await this.agentModel.findById(agentId);
    if (!agentExists) {
      throw new BadRequestException('Account not found please sign up again.');
    }

    if (agentExists.completedOnboarding) {
      throw new BadRequestException('Agent has already completed onboarding');
    }

    const payload = {
      ...agentDto,
      fullname: `${agentDto.firstname} ${agentDto.lastname}`,
      password: crypto
        .createHash('md5')
        .update(agentDto.password)
        .digest('hex'),
      completedOnboarding: true,
    };

    const agent = await this.agentModel.findByIdAndUpdate(agentId, payload, {
      new: true,
    });

    if (agent.invitedBy) {
      //TODO: Notify the user that invited this agent that they have been onaboarded
    }

    const token = createAgentJwtToken({
      id: agent._id,
      email: agent.email,
      firstname: agent.firstname,
      lastname: agent.lastname,
      fullname: agent.fullname,
      licence_number: agent.licence_number,
      region: agent.region,
      emailVerified: agent.emailVerified,
    });
    return {
      agent: {
        id: agent._id,
        email: agent.email,
        firstname: agent.firstname,
        lastname: agent.lastname,
        fullname: agent.fullname,
        region: agent.region,
        licence_number: agent.licence_number,
        emailVerified: agent.emailVerified,
      },
      token,
    };
  }

  async getUserInvitedAgent(id: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const agents = await this.agentModel
      .find({ connectedUsers: { $in: [id] } })
      .skip(skip)
      .limit(limit)
      .exec();
    if (agents.length === 0) {
      throw new BadRequestException('No agent found');
    }
    return { agents };
  }

  async searchForAgents(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search } = paginationDto;
    if (!search) {
      throw new BadRequestException('Search query is required');
    }
    const skip = (page - 1) * limit;
    const query = {
      $or: [
        {
          fullname: new RegExp(new RegExp(search, 'i'), 'i'),
        },
        {
          licence_number: new RegExp(new RegExp(search, 'i'), 'i'),
        },
        {
          region: new RegExp(new RegExp(search, 'i'), 'i'),
        },
        {
          email: new RegExp(new RegExp(search, 'i'), 'i'),
        },
        {
          'mobile.raw_mobile': new RegExp(new RegExp(search, 'i'), 'i'),
        },
        {
          'address.address': new RegExp(new RegExp(search, 'i'), 'i'),
        },
      ],
    };

    const [agents, total] = await Promise.all([
      this.agentModel.find(query).skip(skip).limit(limit).exec(),
      this.agentModel.countDocuments(query),
    ]);
    if (agents.length === 0) {
      throw new BadRequestException('No agent found');
    }
    return { agents, total, page, limit };
  }

  async inviteAgent(dto: InviteAgentDto, user: User) {
    const agent = await this.agentModel.findOne({ email: dto.email }).exec();
    const property = await this.propertyModel.findById(dto.propertyId).exec();
    const tokenPayload = {
      invitedBy: user,
      property: property,
      agent: agent,
    };
    const token = createAgentJwtToken(tokenPayload);
    if (agent) {
      await this.emailService.sendEmail({
        email: agent.email,
        subject: 'Agent Invitation',
        template: 'agent_invite',
        body: {
          inviterName: user.fullname,
          lactionUrl: `${configs.BASE_URL}/agent/accept-invite?propertyId=${property._id.toString()}&userId=${user._id.toString()}`,
        },
      });
    } else {
      await this.emailService.sendEmail({
        email: dto.email,
        subject: 'Agent Invitation',
        template: 'agent_invite',
        body: {
          inviterName: user.fullname,
          lactionUrl: `${configs.BASE_URL}/agent/accept-invite?propertyId=${property._id}&userId=${user._id}`,
        },
      });
    }
    return { token };
  }

  async updateAgentProfile(Agent: Agent, data: Partial<Agent>) {
    if (data?.mobile) {
      const agentExistis = await this.agentModel.findOne({
        'mobile.raw_mobile': data.mobile.raw_mobile,
      });
      if (agentExistis)
        throw new DuplicateException(
          'An account with this mobile already exists',
        );
    }
    //TODO: Perform any notification actions here

    const payload = { ...data };
    if (data?.firstname && data?.lastname) {
      payload['fullname'] = `${data.firstname} ${data.lastname}`;
    }

    const updatedAgent = await this.agentModel.findByIdAndUpdate(
      Agent._id,
      payload,
    );

    const token = createAgentJwtToken(updatedAgent!);

    return {
      Agent: {
        id: updatedAgent!._id,
        email: updatedAgent!.email,
        firstname: updatedAgent!.firstname,
        lastname: updatedAgent!.lastname,
        fullname: updatedAgent!.fullname,
        licence_number: updatedAgent!.licence_number,
        region: updatedAgent!.region,
      },
      token,
    };
  }

  async getAgentProfile(AgentId: string): Promise<Agent> {
    return await this.agentModel.findById(AgentId);
  }
}
