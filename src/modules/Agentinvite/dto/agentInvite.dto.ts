import { IsNotEmpty, IsEmail } from 'class-validator';
import { AgentIviteStatus } from '../schema/agentInvite.schema';

export class InviteAgentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class InviteAgentResponseDto {
  @IsNotEmpty()
  status: AgentIviteStatus;
}
