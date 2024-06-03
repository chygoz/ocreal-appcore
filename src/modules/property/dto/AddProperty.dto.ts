import { IsString, IsUrl, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePropertyDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsUrl()
  @IsOptional()
  thumbNail?: string;

  @IsString()
  @IsNotEmpty()
  documentType: string;
}

export class UpdatePropertyDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsUrl()
  thumbNail?: string;

  @IsOptional()
  @IsString()
  documentType?: string;
}
