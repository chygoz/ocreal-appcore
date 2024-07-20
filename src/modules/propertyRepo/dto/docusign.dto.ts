import { IsOptional, IsString, IsUrl } from 'class-validator';

export class SendDocumentDto {
  @IsOptional()
  @IsString({ each: true })
  documentIds?: string[];
}
