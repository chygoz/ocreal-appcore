import { IsString, IsNotEmpty } from 'class-validator';

export class OneSignalPlayerDto {
  @IsNotEmpty()
  @IsString()
  player_id: string;
}
