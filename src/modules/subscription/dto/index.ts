import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { PlanTypeEnum } from '../schema/plan.schema';

export class PriceDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;
}

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(PlanTypeEnum, { message: 'Invalid plan type' })
  subscriptionType: PlanTypeEnum;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => PriceDto)
  price: { amount: number; currency: string };
}
