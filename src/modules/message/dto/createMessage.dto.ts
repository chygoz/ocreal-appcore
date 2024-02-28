import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  agent: string;

  @IsNotEmpty()
  @IsMongoId()
  property: string;
}

export class CreateAgentMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsMongoId()
  property: string;
}

export class CreateChatDto {
  @IsNotEmpty()
  @IsMongoId()
  message: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];
}

export class IsMongoIdDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
