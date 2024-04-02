import { Type } from 'class-transformer';
import {
  IsString,
  Matches,
  IsOptional,
  IsNotEmpty,
  IsObject,
  IsArray,
  IsNumber,
  IsEmail,
  IsEnum,
} from 'class-validator';

export class AddAddress {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  address: string;

  @IsArray()
  details: [];

  @IsString()
  country: string;

  @IsString()
  city: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z0-9]).{8,}$/;

export class CreateMobileDto {
  @IsString()
  number_body: string;

  @IsString()
  mobile_extension: string;

  @IsString()
  raw_mobile: string;
}

export class OnboardAgentDto {
  @Matches(passwordRegex, { message: 'This password is not strong enough.' })
  password: string;

  @IsString()
  @IsNotEmpty()
  licence_number: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  avatar: string;

  @IsObject()
  @Type(() => CreateMobileDto)
  mobile: CreateMobileDto;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsOptional()
  @Type(() => AddAddress)
  address?: AddAddress;
}

export class UpdateAgentDto {
  // @IsEmail()
  // @IsOptional()
  // email?: string;

  @IsString()
  @IsOptional()
  firstname: string;

  @IsString()
  @IsOptional()
  lastname: string;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsString()
  @IsOptional()
  licence_number?: string;

  @IsString()
  @IsOptional()
  region: string;

  @IsObject()
  @IsOptional()
  @Type(() => CreateMobileDto)
  mobile: CreateMobileDto;

  @IsOptional()
  @Type(() => AddAddress)
  address?: AddAddress;
}

export class InviteAgentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

enum ActionType {
  Accept = 'accept',
  Reject = 'reject',
  Pending = 'pending',
}

export class AgentInviteActionDto {
  @IsNotEmpty()
  agentInvite: string;

  @IsEnum(ActionType)
  action: ActionType;
}
