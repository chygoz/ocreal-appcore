import { IsString, IsArray, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class AgentContractDto {
  @IsString()
  readonly agent: Types.ObjectId;

  @IsOptional()
  @IsString()
  readonly user?: Types.ObjectId;

  @IsString()
  readonly property: Types.ObjectId;

  @IsArray()
  readonly documents: Array<{
    name: string;
    url: string;
    dateAdded?: Date;
  }>;
}
