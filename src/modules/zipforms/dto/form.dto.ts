import { IsNotEmpty, IsString } from 'class-validator';

export class FormDto {

  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
export class FormAuthDto {

  @IsString()
  @IsNotEmpty()
  UserName: string;

  @IsString()
  @IsNotEmpty()
  Password: string;
}