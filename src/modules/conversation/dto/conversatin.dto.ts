import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class MembersDto {
  @IsString()
  @Type(() => Types.ObjectId)
  userId: string;

  @IsString()
  @Type(() => Types.ObjectId)
  agentId?: string;
}

export class CreateConversationDto {
  members: MembersDto;
}

export class OpenConversationDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsOptional()
  agentId?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
