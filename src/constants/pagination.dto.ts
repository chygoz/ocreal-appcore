import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountTypeEnum } from '.';
import { FinanceTypeEnum } from 'src/modules/property/schema/offer.schema';

export class PaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  priceMin?: number;

  @IsOptional()
  priceMax?: number;

  @IsOptional()
  sqTfMin?: number;

  @IsOptional()
  @IsEnum(AccountTypeEnum)
  invitedBy?: AccountTypeEnum;

  @IsOptional()
  sqTfMax?: number;

  @IsOptional()
  bedRooms?: number;

  @IsOptional()
  features: string;

  @IsOptional()
  financeType?: FinanceTypeEnum;

  @IsOptional()
  min: string;

  @IsOptional()
  max: string;
}
