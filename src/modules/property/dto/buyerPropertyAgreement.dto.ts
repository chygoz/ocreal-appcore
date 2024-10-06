import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PropertyPreferenceDto } from 'src/modules/users/dto/propertyPreference.dto';

export class AcceptTermsDto {
  @IsString()
  @IsOptional()
  property: string;

  @IsString()
  @IsOptional()
  listingId: string;

  @IsBoolean()
  @IsNotEmpty()
  accepted: boolean;

  @IsString()
  @IsNotEmpty()
  termsVersion: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyPreferenceDto)
  propertyPreference: PropertyPreferenceDto;
}
