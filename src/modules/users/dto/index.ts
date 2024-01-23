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

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEnum(AccountTypeEnum, { message: 'Invalid account type' })
  account_type: string;

  @IsOptional()
  @Type(() => AddAddress)
  address?: AddAddress;
}

export class UpdateUserDto {
  // @IsEmail()
  // @IsOptional()
  // email?: string;

  // @IsString()
  // @IsOptional()
  // licence_number?: string;

  // @IsString()
  // @IsOptional()
  // fullname: string;

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
