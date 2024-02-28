import { IsInt, IsOptional, Min, IsString, IsArray } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  priceMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  priceMax?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sqTfMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sqTfMax?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  bedRooms?: number;

  @IsOptional()
  features: string;
}
