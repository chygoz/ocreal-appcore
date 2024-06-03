import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class S3FileRequestDto {
  @IsString()
  key: string;
}

export class GetUploadUrlsDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  files: string[];
}
