import { IsEmail, IsString, IsNotEmpty, Matches } from 'class-validator';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z0-9]).{8,}$/;

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SendUserVerificationDto {
  @IsEmail()
  email: string;
}
export class ForgotPasswordDto {
  @Matches(passwordRegex, { message: 'This password is not strong enough.' })
  password: string;
}

export class VerifyForgotPasswordDto {
  @Matches(passwordRegex, { message: 'This password is not strong enough.' })
  password: string;
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
