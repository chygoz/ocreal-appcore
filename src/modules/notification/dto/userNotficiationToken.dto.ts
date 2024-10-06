// create-user-notification-token.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserNotificationTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
