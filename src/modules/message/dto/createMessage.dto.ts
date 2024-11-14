import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  @IsNotEmpty()
  conversationId: string;

  @IsMongoId()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsString()
  file?: string;
}
