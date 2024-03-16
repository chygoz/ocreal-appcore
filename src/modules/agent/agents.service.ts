import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DuplicateException } from 'src/custom_errors';
import { createAgentJwtToken } from 'src/utils/jwt.util';
import { EmailService } from 'src/services/email/email.service';
import { Agent } from './schema/agent.schema';
import { OnboardAgentDto } from './dto';
import * as crypto from 'crypto';
import { PaginationDto } from '../../constants/pagination.dto';

import { Property } from '../property/schema/property.schema';

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
      avatar: agent.avatar,
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
    // if (agents.length === 0) {
    //   throw new BadRequestException('No agent found');
    // }
    return { agents };
  }

  async searchForAgents(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search } = paginationDto;

    const skip = (page - 1) * limit;
    let searchQuery;
    if (search) {
      searchQuery = {
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
    }

    const query = search ? searchQuery : {};
    const [result, total] = await Promise.all([
      this.agentModel.find(query).skip(skip).limit(limit).exec(),
      this.agentModel.countDocuments(query),
    ]);
    if (result.length === 0) {
      throw new BadRequestException('No agent found');
    }
    return { result, total, page, limit };
  }

  // async inviteAgent(
  //   dto: InviteAgentDto,
  //   user: User,
  //   userRole: AccountTypeEnum,
  // ) {
  //   const agent = await this.agentModel.findOne({ email: dto.email }).exec();

  //   const invitePayload = {
  //     email: dto.email,
  //     inviteAccountType: userRole,
  //     invitedBy: user,
  //   };

  //   const alreadyInvited = await this.agentInviteModel
  //     .findOne({ email: dto.email, invitedBy: user })
  //     .exec();

  //   if (agent && !alreadyInvited) {
  //     const invite = await this.agentInviteModel.create(invitePayload);
  //     const createdInvite = await invite.save();
  //     await this.emailService.sendEmail({
  //       email: dto.email,
  //       subject: 'Agent Invitation',
  //       template: 'agent_invite',
  //       body: {
  //         inviterName: user.fullname,
  //         lactionUrl: `${configs.BASE_URL}/agent/accept-invite?agentInviteId=${createdInvite._id.toString()}`,
  //       },
  //     });
  //     return createdInvite;
  //   } else if (alreadyInvited) {
  //     await this.emailService.sendEmail({
  //       email: dto.email,
  //       subject: 'Agent Invitation',
  //       template: 'agent_invite',
  //       body: {
  //         inviterName: user.fullname,
  //         lactionUrl: `${configs.BASE_URL}/agent/accept-invite?agentInviteId=${alreadyInvited._id.toString()}`,
  //       },
  //     });
  //     return alreadyInvited;
  //   }

  //   const invite = await this.agentInviteModel.create(invitePayload);
  //   await invite.save();

  //   await this.emailService.sendEmail({
  //     email: dto.email,
  //     subject: 'Agent Invitation',
  //     template: 'agent_invite',
  //     body: {
  //       inviterName: user.fullname,
  //       lactionUrl: `${configs.BASE_URL}/auth/signup?email=${dto.email}`,
  //     },
  //   });

  //   return { result: invite };
  // }

  // async acceptUserInvite(user: User, dto: AgentInviteActionDto) {
  //   const invite = await this.agentInviteModel.findById(dto.agentInvite).exec();
  //   if (!invite) {
  //     throw new NotFoundException('Agent invite not found');
  //   }
  //   if (invite.currentStatus !== AgentInviteStatusEnum.pending) {
  //     throw new BadRequestException('You have already reacted to this invite');
  //   }

  //   const action =
  //     dto.action == AgentInviteStatusEnum.accepted
  //       ? AgentInviteStatusEnum.accepted
  //       : AgentInviteStatusEnum.rejected;
  //   const update = await this.agentInviteModel.findByIdAndUpdate(invite.id, {
  //     currentStatus: action,
  //   });
  //   return { result: invite };
  // }

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
