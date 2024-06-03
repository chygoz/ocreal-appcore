import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsString,
  // IsDate,
  ValidateNested,
} from 'class-validator';

class EventDateDTO {
  @IsDateString()
  eventDate: Date;

  @IsString()
  tourTime: string;
}

export class CreateTourDto {
  @IsNotEmpty()
  @IsMongoId()
  property: string;

  @ValidateNested({ each: true })
  @Type(() => EventDateDTO)
  eventDate: EventDateDTO[];

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}

export class IsMongoIdDto {
  @IsMongoId()
  id: string;
}
