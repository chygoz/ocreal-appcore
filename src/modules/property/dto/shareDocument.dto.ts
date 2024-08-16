import { IsString, IsEmail, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSharePropertyDocDto {
  @IsString()
  role: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  property: Types.ObjectId;
}
