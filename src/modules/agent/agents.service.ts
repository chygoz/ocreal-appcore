import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DuplicateException } from 'src/custom_errors';
import { createAgentJwtToken } from 'src/utils/jwt.util';
import { EmailService } from 'src/services/email/email.service';
import { Agent } from './schema/agent.schema';
import { CreateAgentDto } from './dto';
import crypto from 'crypto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
    private readonly emailService: EmailService,
  ) {}

  async createAgent(agentId: string, agentDto: CreateAgentDto) {
    const userExists = await this.agentModel.findById(agentId);
    if (!userExists) {
      throw new BadRequestException('Account not found please sign up again.');
    }

    const payload = {
      ...agentDto,
      fullname: `${agentDto.firstname} ${agentDto.lastname}`,
      password: crypto
        .createHash('md5')
        .update(agentDto.password)
        .digest('hex'),
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
      },
      token,
    };
  }

  // async sendAgentVerificationEmail(emailDto: { email: string }): Promise<any> {
  //   const AgentExists = await this.agentModel.findOne({
  //     email: emailDto.email,
  //   });
  //   if (AgentExists) throw new DuplicateException();
  //   await this.agentModel.create({ email: emailDto.email });
  //   const token = createEmailJwtToken({
  //     email: emailDto.email,
  //     id: AgentExists.id,
  //   });
  //   await this.emailService.sendEmail({
  //     email: emailDto.email,
  //     subject: 'Welcome to OCReal',
  //     body: `${configs.BASE_URL}/auth/verify-email/${token}`,
  //   });
  //   return;
  // }

  // async resendVerificationEmail(emailDto: { email: string }): Promise<any> {
  //   const Agent = await this.agentModel.findOne({ email: emailDto.email });
  //   await this.agentModel.findOneAndUpdate({ email: emailDto.email });
  //   const token = createEmailJwtToken({ email: emailDto.email, id: Agent.id });
  //   await this.emailService.sendEmail({
  //     email: emailDto.email,
  //     subject: 'Welcome to OCReal',
  //     body: `${configs.BASE_URL}/auth/verify-email/${token}`,
  //   });
  //   return;
  // }

  // async verifyEmail(token: string): Promise<any> {
  //   const decodedToken: any = decodeEmailJwtToken(token);
  //   if (!decodedToken)
  //     throw new UnauthorizedException('Verification link expired or invalid.');
  //   const agent = await this.agentModel.findById(decodedToken.id);
  //   if (!agent) throw new UnauthorizedException();
  //   await this.agentModel.findByIdAndUpdate(
  //     agent.id,
  //     {
  //       emailVerified: true,
  //     },
  //     { new: true },
  //   );
  //   return;
  // }

  async updateAgentProfile(Agent: Agent, data: Partial<Agent>) {
    // if (data?.email) {
    //   const agentExistis = await this.agentModel.findOne({
    //     email: data.email.toLowerCase(),
    //   });

    //   if (agentExistis)
    //     throw new DuplicateException(
    //       'An account with this email already exists',
    //     );
    // }
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
