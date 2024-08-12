import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsString,
  // IsDate,
  ValidateNested,
  IsOptional,
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

export class PropertyTourScheduleDto {
  @IsNotEmpty()
  @IsString()
  property: string;

  @IsNotEmpty()
  @Type(() => Date)
  eventDate: Date;
  @IsOptional()
  @IsString()
  startTime: string;

  @IsOptional()
  @IsString()
  endTime: string;

  @IsNotEmpty()
  @IsString()
  timeZone: string;
}

export class UpdatePropertyTourScheduleDto {
  @IsOptional()
  @Type(() => Date)
  eventDate?: Date;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  timeZone?: string;
}
