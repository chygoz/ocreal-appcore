import { IsNotEmpty, IsMongoId, IsDateString } from 'class-validator';

export class CreateTourDto {
  @IsNotEmpty()
  @IsMongoId()
  property: string;

  @IsNotEmpty()
  @IsDateString()
  tourDate: Date;
}

export class IsMongoIdDto {
  @IsMongoId()
  id: string;
}
