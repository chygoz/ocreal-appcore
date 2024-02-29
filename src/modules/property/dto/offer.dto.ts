import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FinanceTypeEnum } from '../schema/offer.schema';

class Price {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;
}

export class CreateOfferDto {
  @IsEnum(FinanceTypeEnum)
  financeType: FinanceTypeEnum;

  @IsBoolean()
  apprasalContingency: boolean;

  @ValidateNested()
  @Type(() => Price)
  offerPrice?: Price;

  @ValidateNested()
  @Type(() => Price)
  downPayment?: Price;

  @ValidateNested()
  @Type(() => Price)
  loanAmount?: Price;

  @IsBoolean()
  inspectionContingency: boolean;

  @IsString()
  property: string;
}
