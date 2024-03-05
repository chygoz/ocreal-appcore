import { Type } from 'class-transformer';
import {
  IsString,
  Matches,
  IsOptional,
  IsNotEmpty,
  IsObject,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { AccountTypeEnum } from 'src/constants';

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

export class PreApprovalDocumentDto {
  @IsString()
  expiryDate: Date;

  @IsString()
  url: string;
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

export class CreateUserDto {
  @Matches(passwordRegex, { message: 'This password is not strong enough.' })
  password: string;

  @IsObject()
  @Type(() => CreateMobileDto)
  mobile: CreateMobileDto;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsBoolean()
  @IsOptional()
  preApproval: boolean;

  @IsString()
  @IsOptional()
  lastname: string;

  @IsEnum(AccountTypeEnum, { message: 'Invalid account type' })
  account_type: string;

  @IsOptional()
  @Type(() => AddAddress)
  address?: AddAddress;

  @IsOptional()
  @Type(() => PreApprovalDocumentDto)
  preApprovalDocument?: PreApprovalDocumentDto;
}

export class UpdateUserDto {
  @IsOptional()
  @Type(() => PreApprovalDocumentDto)
  preApprovalDocument: PreApprovalDocumentDto;

  @IsBoolean()
  @IsNotEmpty()
  preApproval: boolean;

  @IsObject()
  @IsOptional()
  @Type(() => CreateMobileDto)
  mobile: CreateMobileDto;

  @IsString()
  @IsOptional()
  firstname: string;

  @IsString()
  @IsOptional()
  lastname: string;

  @IsOptional()
  @Type(() => AddAddress)
  address?: AddAddress;
}
