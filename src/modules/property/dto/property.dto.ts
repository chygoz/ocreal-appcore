import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsMongoId,
  IsEmail,
} from 'class-validator';

class PropertyAddressDetailsDto {
  @IsString()
  formattedAddress: string;

  @IsString()
  latitude: string;

  @IsString()
  longitude: string;

  @IsString()
  placeId?: string;

  @IsString()
  streetNumber?: string;

  @IsString()
  streetName?: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  state: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  country?: string;
}

class BrokerDto {
  @Type(() => String)
  @IsString()
  agent: string;

  @IsString()
  role: string;
}

class PriceDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;
}

class PropertyTaxDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @ValidateNested()
  @Type(() => Date)
  dateSeen: Date[];
}

class PropertyDocumentDto {
  @IsString()
  name: string;

  @IsString()
  url: string;
}

class PropertyFeaturesDto {
  @IsNotEmpty()
  @IsString()
  feature: string;

  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsString()
  description: string;
}

class PropertyImageDto {
  @IsString()
  url: string;
  @IsString()
  thumbNail: string;
}

class PropertyVideoDto {
  @IsString()
  url: string;
  @IsString()
  thumbNail: string;
}

export class UpdatePropertyDto {
  @ValidateNested()
  @Type(() => PropertyAddressDetailsDto)
  propertyAddressDetails: PropertyAddressDetailsDto;

  @IsArray()
  images: PropertyImageDto[];

  @IsArray()
  videos: PropertyVideoDto[];

  @ValidateNested()
  @Type(() => PropertyDocumentDto)
  propertyDocument: Array<{
    name: string;
    url: string;
  }>;

  @ValidateNested()
  @Type(() => BrokerDto)
  brokers: Array<{
    agent: string;
    role: string;
  }>;

  @IsArray()
  @ValidateNested()
  @Type(() => PropertyFeaturesDto)
  features: Array<{ feature: string; icon: string; description: string }>;

  @IsString()
  propertyDescription: string;

  @IsString()
  lotSizeValue: string;

  @IsString()
  lotSizeUnit: string;

  @IsString()
  numBathroom: string;

  @IsString()
  numBedroom: string;

  @ValidateNested()
  @Type(() => PriceDto)
  price: {
    amount: number;
    currency: string;
  };

  @ValidateNested()
  @Type(() => PropertyTaxDto)
  propertyTaxes: {
    amount: number;
    currency: number;
    dateSeen: Array<Date>;
  }[];

  @IsString()
  propertyType: string;
}
export class AddAgentToPropertyDto {
  @IsEmail()
  @IsNotEmpty()
  agentEmail: string;

  @IsNotEmpty()
  @IsMongoId()
  propertyId: string;
}

export class AgentAcceptInviteDto {
  @IsNotEmpty()
  @IsMongoId()
  inviteId: string;

  @IsNotEmpty()
  @IsString()
  response: string;
}

export class CreatePropertyDto {
  @ValidateNested()
  @Type(() => PropertyAddressDetailsDto)
  propertyAddressDetails: PropertyAddressDetailsDto;

  // @IsArray()
  // @IsString({ each: true })
  // images: string[];

  // @IsArray()
  // @IsString({ each: true })
  // videos: string[];

  // @ValidateNested()
  // @Type(() => PropertyDocumentDto)
  // propertyDocument: Array<{
  //   name: string;
  //   url: string;
  // }>;

  // @ValidateNested()
  // @Type(() => BrokerDto)
  // brokers: Array<{
  //   agent: string;
  //   role: string;
  // }>;

  // @IsArray()
  // @IsString({ each: true })
  // features: Array<string>;

  // @IsString()
  // propertyName: string;

  // @IsString()
  // lotSizeValue: string;

  // @IsString()
  // lotSizeUnit: string;

  // @IsString()
  // numBathroom: string;

  // @IsString()
  // numBedroom: string;

  // @ValidateNested()
  // @Type(() => PriceDto)
  // prices: {
  //   amount: number;
  //   currency: string;
  // };

  // @ValidateNested()
  // @Type(() => PropertyTaxDto)
  // propertyTaxes: Array<{
  //   amount: number;
  //   currency: number;
  //   dateSeen: [Date];
  // }>;

  // @IsString()
  // propertyType: string;
}

export class AgentCreatePropertyDto {
  @ValidateNested()
  @Type(() => PropertyAddressDetailsDto)
  propertyAddressDetails: PropertyAddressDetailsDto;

  // @IsString()
  // @IsNotEmpty()
  // seller: string;

  // @IsArray()
  // @IsString({ each: true })
  // images: string[];

  // @IsArray()
  // @IsString({ each: true })
  // videos: string[];

  // @ValidateNested()
  // @Type(() => PropertyDocumentDto)
  // propertyDocument: Array<{
  //   name: string;
  //   url: string;
  // }>;

  // @ValidateNested()
  // @Type(() => BrokerDto)
  // brokers: Array<{
  //   agent: string;
  //   role: string;
  // }>;

  // @IsArray()
  // @IsString({ each: true })
  // features: Array<string>;

  // @IsString()
  // propertyName: string;

  // @IsString()
  // lotSizeValue: string;

  // @IsString()
  // lotSizeUnit: string;

  // @IsString()
  // numBathroom: string;

  // @IsString()
  // numBedroom: string;

  // @ValidateNested()
  // @Type(() => PriceDto)
  // prices: {
  //   amount: number;
  //   currency: string;
  // };

  // @ValidateNested()
  // @Type(() => PropertyTaxDto)
  // propertyTaxes: Array<{
  //   amount: number;
  //   currency: number;
  //   dateSeen: [Date];
  // }>;

  // @IsString()
  // propertyType: string;
}
