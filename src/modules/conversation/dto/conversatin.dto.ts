import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateConversationDto {
  @IsMongoId()
  @IsNotEmpty()
  propertyId: string;

  @IsMongoId()
  @IsOptional()
  buyerAgent: string;

  // @IsMongoId()
  // @IsNotEmpty()
  // seller?: string;
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
