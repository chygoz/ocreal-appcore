import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountTypeEnum } from 'src/constants';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z0-9]).{8,}$/;

export class CreateMobileDto {
  @IsString()
  number_body: string;

  @IsString()
  mobile_extension: string;

  @IsString()
  raw_mobile: string;
}

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

export class CreateUserDto {
  @IsEmail()
  email: string;

  @Matches(passwordRegex, { message: 'This password is not strong enough.' })
  password: string;

  @IsString()
  @IsOptional()
  licence_number?: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

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

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SendUserEverificationDto {
  @IsEmail()
  email: string;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @Matches(passwordRegex, { message: 'This password is not strong enough.' })
  password?: string;

  @IsString()
  @IsOptional()
  licence_number?: string;

  @IsString()
  @IsOptional()
  fullname: string;

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
