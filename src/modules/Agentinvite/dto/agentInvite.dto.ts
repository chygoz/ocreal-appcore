import { AgentIviteStatus } from '../schema/agentInvite.schema';
import {
  IsArray,
  IsEmail,
  ArrayNotEmpty,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';

export class InviteAgentDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  emails: string[];
}

export class InviteAgentResponseDto {
  @IsNotEmpty()
  status: AgentIviteStatus;
}
