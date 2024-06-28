import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class PropertyPreferenceDto {
  @IsString()
  propertyType: string;

  @IsNumber()
  spendAmount: number;

  @IsString()
  financialProcess: string;

  @IsBoolean()
  preApprovalAffiliates: boolean;

  @IsBoolean()
  workWithLender: boolean;
}
