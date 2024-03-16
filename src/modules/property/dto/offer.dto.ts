import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
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

export class CreateUserOfferDto {
  // @ValidateNested({ each: true })
  // @Type(() => OfferStatus)
  // status: OfferStatus[];

  // @IsEnum(OfferStatusEnum)
  // currentStatus: OfferStatusEnum;

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
  property: string;

  @IsString()
  buyerAgent: string;

  @IsString()
  coverLetter: string;

  // @IsString()
  // buyer: string;

  // @IsString()
  // seller: string;

  // @IsString()
  // sellerAgent: string;

  // @IsString()
  // buyerAgent: string;

  // @Type(() => Date)
  // @IsString()
  // createdAt: Date;

  // @Type(() => Date)
  // @IsString()
  // updatedAt: Date;
}
export class CreateAgentPropertyOfferDto {
  // @ValidateNested({ each: true })
  // @Type(() => OfferStatus)
  // status: OfferStatus[];

  // @IsEnum(OfferStatusEnum)
  // currentStatus: OfferStatusEnum;

  @IsEnum(FinanceTypeEnum)
  financeType: FinanceTypeEnum;

  // @IsEnum(OfferCreatorTypeEnum)
  // offerCreator: OfferCreatorTypeEnum;

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

  @IsNotEmpty()
  @IsString()
  buyer: string;

  @IsString()
  coverLetter: string;
}
