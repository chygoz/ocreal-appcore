import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SpendAmountDto {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

export class PropertyPreferenceDto {
  @IsOptional()
  @IsString()
  propertyType: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpendAmountDto)
  spendAmount: SpendAmountDto;

  @IsOptional()
  @IsString()
  financialProcess: string;

  @IsOptional()
  @IsBoolean()
  preApprovalAffiliates: boolean;

  @IsOptional()
  @IsBoolean()
  workWithLender: boolean;
}
