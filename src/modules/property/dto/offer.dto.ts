import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FinanceTypeEnum } from '../schema/offer.schema';

export class Price {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;
}

export class Contingency {
  @IsNumber()
  amount: number;

  @IsString()
  unit: string;
}
export class DocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}

export class SellerOrSellerAgentAcceptOffer {
  @IsNotEmpty()
  @IsString()
  header: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsString()
  offerId: string;

  @IsNotEmpty()
  @IsBoolean()
  response: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOtherParties: boolean;
}

export class CreateUserOfferDto {
  @IsEnum(FinanceTypeEnum)
  financeType: FinanceTypeEnum;

  @IsArray()
  documents?: DocumentDto[];

  @IsNotEmpty()
  apprasalContingency: boolean | Contingency;

  @IsNotEmpty()
  financeContingency: boolean | Contingency;

  @IsNotEmpty()
  inspectionContingency: boolean | Contingency;

  @IsNotEmpty()
  closeEscrow: boolean | Contingency;

  @ValidateNested()
  @Type(() => Price)
  offerPrice: Price;

  @ValidateNested()
  @Type(() => Price)
  downPayment: Price;

  @ValidateNested()
  @Type(() => Price)
  loanAmount: Price;

  @IsNotEmpty()
  @IsBoolean()
  submitWithOutAgentApproval: boolean;

  @IsString()
  @IsOptional()
  buyerAgent?: string;

  @IsString()
  coverLetter: string;

  @IsString()
  property: string;
}
export class CreateCounterOfferDto {
  @IsEnum(FinanceTypeEnum)
  financeType: FinanceTypeEnum;

  @IsOptional()
  @IsArray()
  documents?: DocumentDto[];

  @IsNotEmpty()
  apprasalContingency: boolean | Contingency;

  @IsNotEmpty()
  financeContingency: boolean | Contingency;

  @IsNotEmpty()
  inspectionContingency: boolean | Contingency;

  @IsNotEmpty()
  closeEscrow: boolean | Contingency;

  @ValidateNested()
  @Type(() => Price)
  offerPrice: Price;

  @ValidateNested()
  @Type(() => Price)
  downPayment: Price;

  @ValidateNested()
  @Type(() => Price)
  loanAmount: Price;

  @IsNotEmpty()
  @IsOptional()
  @IsBoolean()
  submitWithOutAgentApproval: boolean;

  @IsString()
  @IsOptional()
  buyerAgent?: string;

  @IsString()
  @IsOptional()
  coverLetter: string;
}

export class OfferResponseDto {
  @IsNotEmpty()
  @IsBoolean()
  response: boolean;

  @IsNotEmpty()
  @IsString()
  counterOfferId: string;
}
export class CreateAgentPropertyOfferDto {
  @IsEnum(FinanceTypeEnum)
  financeType: FinanceTypeEnum;

  @IsNotEmpty()
  apprasalContingency: boolean | Contingency;

  @IsNotEmpty()
  financeContingency: boolean | Contingency;

  @IsNotEmpty()
  inspectionContingency: boolean | Contingency;

  @IsNotEmpty()
  closeEscrow: boolean | Contingency;

  @ValidateNested()
  @Type(() => Price)
  offerPrice: Price;

  @ValidateNested()
  @Type(() => Price)
  downPayment: Price;

  @ValidateNested()
  @Type(() => Price)
  loanAmount: Price;

  @IsString()
  property: string;

  @IsOptional()
  @IsString()
  buyer: string;

  @IsOptional()
  @IsString()
  coverLetter: string;
}
