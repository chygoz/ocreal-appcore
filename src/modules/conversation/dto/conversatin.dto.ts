import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class MembersDto {
  @IsString()
  @Type(() => Types.ObjectId)
  propertyId: string;

  @IsString()
  @Type(() => Types.ObjectId)
  sellerId: string;

  @IsString()
  @Type(() => Types.ObjectId)
  sellerAgentId: string;

  @IsString()
  @Type(() => Types.ObjectId)
  buyerId: string;

  @IsString()
  @IsString()
  @Type(() => Types.ObjectId)
  buyerAgentId?: string;
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
