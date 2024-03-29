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
import { InviteAgentResponseDto } from './dto/agentInvite.dto';

@Injectable()
export class InviteService {
  constructor(
    @InjectModel(AgentInvite.name)
    private readonly agentInviteModel: Model<AgentInvite>,
    @InjectModel(Agent.name)
    private readonly agentModel: Model<Agent>,
    private readonly emailService: EmailService,
  ) {}

  async inviteAnAgent(user: User, { email }: { email: string }) {
    const agent = await this.agentModel.findOne({ email });
    let invite;
    if (agent) {
      const newInvite = await this.agentInviteModel.create({
        email,
        invitedBy: user,
        status: AgentIviteStatus.pending,
        agent,
      });
      invite = newInvite.save();
    }
    const newInvite = await this.agentInviteModel.create({
      email,
      invitedBy: user,
      status: AgentIviteStatus.pending,
    });
    invite = newInvite.save();
    await this.emailService.sendEmail({
      email: email,
      subject: 'Agent Accepted Invitation',
      template: 'invite_new_agent',
      body: {
        inviterName: user.fullname,
        lactionUrl: `${configs.BASE_URL}/agent/accept-invite?inviteId=${invite._id.toString()}`,
      },
    });
    return invite;
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
