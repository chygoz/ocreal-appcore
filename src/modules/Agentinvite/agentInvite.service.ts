import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/services/email/email.service';
import { AgentInvite, AgentIviteStatus } from './schema/agentInvite.schema';
import { User } from '../users/schema/user.schema';
import { Agent } from '../agent/schema/agent.schema';
import { configs } from 'src/configs';
import { PaginationDto } from 'src/constants/pagination.dto';
import { InviteAgentDto, InviteAgentResponseDto } from './dto/agentInvite.dto';

@Injectable()
export class InviteService {
  constructor(
    @InjectModel(AgentInvite.name)
    private readonly agentInviteModel: Model<AgentInvite>,
    @InjectModel(Agent.name)
    private readonly agentModel: Model<Agent>,
    private readonly emailService: EmailService,
  ) {}

  async inviteAnAgent(user: User, { emails }: InviteAgentDto) {
    const response = [];
    for (const email of emails) {
      const alreadyinvited = await this.agentInviteModel.findOne({
        email,
        invitedBy: user._id,
      });
      console.log(process.env.DEV_SELF_BASE_URL);
      if (alreadyinvited) {
        await this.emailService.sendEmail({
          email: email,
          subject: 'OCreal Agent Invitation',
          template: 'invite_new_agent',
          body: {
            inviterName: user.fullname,
            lactionUrl: `${process.env.DEV_SELF_BASE_URL}/agent/accept-invite?inviteId=${alreadyinvited._id.toString()}`,
          },
        });
        response.push(alreadyinvited);
        continue;
      }
      const newInvite = await this.agentInviteModel.create({
        email,
        invitedBy: user,
        status: AgentIviteStatus.pending,
      });
      const invite = await newInvite.save();
      await this.emailService.sendEmail({
        email: email,
        subject: 'OCreal Agent Invitation',
        template: 'invite_new_agent',
        body: {
          inviterName: user.fullname,
          lactionUrl: `${configs.BASE_URL}/agent/accept-invite?inviteId=${invite._id.toString()}`,
        },
      });
      response.push(invite);
      continue;
    }
    return {
      message: 'Agent Invited successfully',
    };
  }

  async agentInviteResponse(
    id: string,
    agent: Agent,
    { status }: InviteAgentResponseDto,
  ) {
    const invite = await this.agentInviteModel.findById(id);
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.status !== AgentIviteStatus.pending) {
      throw new BadRequestException(
        'You have already responded to this invite',
      );
    }
    const update = await this.agentInviteModel.findByIdAndUpdate(
      id,
      {
        status:
          status == AgentIviteStatus.accepted
            ? AgentIviteStatus.accepted
            : AgentIviteStatus.rejected,
        agent: agent._id,
      },
      {
        new: true,
      },
    );
    await this.agentModel.findByIdAndUpdate(agent.id, {
      $addToSet: { connectedUsers: invite.invitedBy.id },
    });
    return { invite: update };
  }

  async getAgentInvites(agent: Agent, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [invites, total] = await Promise.all([
      this.agentInviteModel
        .find({
          email: agent.email,
          status: { $ne: AgentIviteStatus.pending },
        })
        .sort({ createdAt: 1 })
        .populate('inviteBy')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.agentInviteModel.countDocuments({
        _id: agent._id,
        status: { $ne: AgentIviteStatus.pending },
      }),
    ]);
    if (invites.length === 0) {
      throw new BadRequestException('No invite found');
    }
    return { invites, total, page, limit };
  }

  async getRecentInvite(agent: Agent) {
    const invite = await this.agentInviteModel
      .findOne({
        email: agent.email,
        status: { $ne: AgentIviteStatus.pending },
      })
      .sort({ createdAt: 1 })
      .populate('inviteBy')
      .exec();
    if (!invite) {
      throw new BadRequestException('No invite found');
    }
    return { invite };
  }
}
