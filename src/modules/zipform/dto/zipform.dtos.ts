import { IsNotEmpty, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer'; // Import Type for nested validation
import { TransactionPropertyType, TransactionType } from './zipform.enum';

// Define the dataDto class
export class DataDto {
  @IsNotEmpty()
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsNotEmpty()
  @IsEnum(TransactionPropertyType)
  propertyType: TransactionPropertyType;
}

// Define the CreateTransactionDto class
export class CreateTransactionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DataDto)
  data: DataDto;
  @IsNotEmpty()
  @IsString()
  status: string;
}
