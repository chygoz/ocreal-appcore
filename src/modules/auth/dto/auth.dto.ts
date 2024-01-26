import {
  IsEmail,
  IsString,
  IsNotEmpty,
  Matches,
  IsEnum,
} from 'class-validator';
import { AccountTypeEnum } from 'src/constants';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z0-9]).{8,}$/;

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AccountSignUpDto {
  @IsEmail()
  email: string;

  @IsEnum(AccountTypeEnum, { message: 'Invalid account type' })
  account_type: string;
}

export class SendUserVerificationDto {
  @IsEmail()
  email: string;
}

export class UpdatePasswordDto {
  @Matches(passwordRegex, { message: 'This password is not strong enough.' })
  password: string;
}

export class VerifyCode {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class UserUpdatePasswordDto {
  @Matches(passwordRegex, { message: 'This password is not strong enough.' })
  password: string;
}

export class VerifyUserEmail {
  @IsString()
  @IsNotEmpty()
  token: string;
}
