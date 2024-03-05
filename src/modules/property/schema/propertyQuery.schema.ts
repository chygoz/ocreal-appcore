import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PropertyQuery extends Document {
  @Prop()
  ListingKey: string;

  @Prop()
  ModificationTimestamp: Date;

  @Prop()
  ListingId: string;

  @Prop()
  PropertyType: string;

  @Prop()
  PropertySubType: string;

  @Prop()
  ListPrice: number;

  @Prop()
  BathroomsTotalInteger: number;

  @Prop()
  BedroomsTotal: number;

  @Prop()
  StandardStatus: string;

  @Prop()
  LotSizeArea: number;

  @Prop()
  LivingArea: number;

  @Prop()
  BuildingAreaTotal: number;

  @Prop()
  City: string;

  @Prop()
  PostalCode: string;

  @Prop([Number])
  Coordinates: number[];

  @Prop()
  Latitude: number;

  @Prop()
  Longitude: number;

  @Prop()
  BathroomsHalf: number;

  @Prop()
  YearBuilt: number;

  @Prop()
  InternetAddressDisplayYN: boolean;

  @Prop()
  Media: {
    Order: number;
    MediaURL: string;
    MimeType: string;
    ClassName: string;
    ResourceName: string;
    MediaCategory: string;
    MediaObjectID: string;
    ShortDescription: string;
    ResourceRecordKey: string;
  }[];

  @Prop()
  UnparsedAddress: string;

  @Prop()
  PublicRemarks: string;

  @Prop([String])
  Gas: string[];

  @Prop([String])
  Roof: string[];

  @Prop([String])
  View: string[];

  @Prop()
  Model: string;

  @Prop([String])
  Sewer: string[];

  @Prop([String])
  Skirt: string[];

  @Prop()
  SpaYN: boolean;

  @Prop([String])
  Levels: string[];

  @Prop()
  TaxLot: string;

  @Prop()
  ViewYN: boolean;

  @Prop()
  Zoning: string;

  @Prop()
  CapRate: number;

  @Prop([String])
  Cooling: string[];

  @Prop()
  Country: string;

  @Prop([String])
  Fencing: string[];

  @Prop([String])
  Heating: string[];

  @Prop()
  Stories: number;

  @Prop()
  TaxYear: number;

  @Prop([String])
  Basement: string[];

  @Prop([String])
  BodyType: string[];

  @Prop([String])
  Electric: string[];

  @Prop([String])
  Flooring: string[];

  @Prop()
  GarageYN: boolean;

  @Prop()
  ParkName: string;

  @Prop()
  RoomType: string;

  @Prop()
  TaxBlock: string;

  @Prop()
  TaxTract: string;

  @Prop()
  Township: string;

  @Prop()
  CarportYN: boolean;

  @Prop()
  CoolingYN: boolean;

  @Prop()
  Elevation: number;

  @Prop()
  Furnished: string;

  @Prop()
  HeatingYN: boolean;

  @Prop()
  OwnerName: string;

  @Prop([String])
  OwnerPays: string[];

  @Prop()
  Ownership: string;

  @Prop([String])
  Utilities: string[];

  @Prop([String])
  Appliances: string[];

  @Prop()
  CityRegion: string;

  @Prop()
  Exclusions: string;

  @Prop()
  Inclusions: string;

  @Prop()
  Possession: string;

  @Prop()
  PostalCity: string;

  @Prop()
  RoomsTotal: number;

  @Prop()
  StreetName: string;

  @Prop()
  UnitNumber: string;

  @Prop()
  BuilderName: string;

  @Prop([String])
  CommonWalls: string[];

  @Prop()
  Concessions: string;

  @Prop()
  Contingency: string;

  @Prop()
  CrossStreet: string;

  @Prop([String])
  Disclosures: string[];

  @Prop()
  FireplaceYN: boolean;

  @Prop([String])
  LotFeatures: string[];

  @Prop([String])
  PetsAllowed: string[];

  @Prop()
  PhotosCount: number;

  @Prop()
  PoolExpense: number;

  @Prop([String])
  PossibleUse: string[];

  @Prop()
  ShowingDays: number;

  @Prop([String])
  SpaFeatures: string[];

  @Prop()
  StateRegion: string;

  @Prop([String])
  SyndicateTo: string[];

  @Prop()
  VideosCount: number;

  @Prop([String])
  WaterSource: string[];

  @Prop()
  BuilderModel: string;

  @Prop()
  BuildingName: string;

  @Prop()
  BusinessName: string;

  @Prop([String])
  BusinessType: string[];

  @Prop()
  BuyerTeamKey: string;

  @Prop()
  CarrierRoute: string;

  @Prop()
  DaysOnMarket: number;

  @Prop([String])
  DoorFeatures: string[];

  @Prop([String])
  FrontageType: string[];

  @Prop()
  GarageSpaces: number;

  @Prop()
  LeasableArea: number;

  @Prop()
  ListPriceLow: number;

  @Prop()
  LotSizeAcres: number;

  @Prop()
  LotSizeUnits: string;

  @Prop()
  OnMarketDate: Date;

  @Prop()
  OtherParking: string;

  @Prop()
  ParkingTotal: number;

  @Prop([String])
  PoolFeatures: string[];

  @Prop([String])
  RentIncludes: string[];

  @Prop()
  StoriesTotal: number;

  @Prop()
  StreetNumber: string;

  @Prop()
  StreetSuffix: string;

  @Prop()
  TaxMapNumber: string;

  @Prop()
  TrashExpense: number;

  @Prop()
  UnitTypeType: string;

  @Prop()
  WaterfrontYN: boolean;

  @Prop()
  AssociationYN: boolean;

  @Prop()
  BathroomsFull: number;

  @Prop()
  CountryRegion: string;

  @Prop()
  CoveredSpaces: number;

  @Prop()
  EntryLocation: string;

  @Prop()
  LotSizeSource: string;

  @Prop()
  OffMarketDate: Date;

  @Prop()
  OpenParkingYN: boolean;

  @Prop()
  OwnershipType: string;

  @Prop()
  PoolPrivateYN: boolean;

  @Prop()
  WithdrawnDate: Date;

  @Prop()
  ApprovalStatus: string;

  @Prop()
  AssociationFee: number;

  @Prop([String])
  BuyerFinancing: string[];

  @Prop()
  ContingentDate: Date;

  @Prop()
  CountyOrParish: string;

  @Prop()
  DirectionFaces: string;

  @Prop()
  DocumentsCount: number;

  @Prop()
  ExpirationDate: Date;

  @Prop([String])
  OtherEquipment: string[];

  @Prop()
  PrivateRemarks: string;

  @Prop()
  ShowingEndTime: Date;

  @Prop()
  UnitsFurnished: string;

  @Prop([String])
  WindowFeatures: string[];

  @Prop()
  CancelationDate: Date;

  @Prop()
  FireplacesTotal: number;

  @Prop()
  LandLeaseAmount: number;

  @Prop([String])
  LaundryFeatures: string[];

  @Prop()
  LeaseExpiration: Date;

  @Prop()
  LicensesExpense: number;

  @Prop()
  LivingAreaUnits: string;

  @Prop()
  LockBoxLocation: string;

  @Prop([String])
  OtherStructures: string[];

  @Prop()
  ParkManagerName: string;

  @Prop([String])
  ParkingFeatures: string[];

  @Prop([String])
  RoadSurfaceType: string[];

  @Prop()
  StateOrProvince: string;

  @Prop()
  StreetDirPrefix: string;

  @Prop()
  StreetDirSuffix: string;

  @Prop()
  SubdivisionName: string;

  @Prop()
  TaxAnnualAmount: number;

  @Prop()
  AttachedGarageYN: boolean;

  @Prop()
  AvailabilityDate: Date;

  @Prop()
  BathroomsPartial: number;

  @Prop()
  BedroomsPossible: number;

  @Prop([String])
  BuildingFeatures: string[];

  @Prop([String])
  ExteriorFeatures: string[];

  @Prop([String])
  InteriorFeatures: string[];

  @Prop([String])
  LaborInformation: string[];

  @Prop([String])
  RoadFrontageType: string[];

  @Prop([String])
  SecurityFeatures: string[];

  @Prop()
  TaxAssessedValue: number;

  @Prop([String])
  TaxStatusCurrent: string[];

  @Prop()
  YearBuiltDetails: string;

  @Prop()
  ConcessionsAmount: number;

  @Prop([String])
  FireplaceFeatures: string[];

  @Prop([String])
  FoundationDetails: string[];

  @Prop()
  LotSizeDimensions: string;

  @Prop()
  LotSizeSquareFeet: number;

  @Prop()
  OriginalListPrice: number;

  @Prop()
  PreviousListPrice: number;

  @Prop([String])
  PropertyCondition: string[];

  @Prop()
  PublicSurveyRange: string;

  @Prop()
  YearsCurrentOwner: number;

  @Prop()
  ZoningDescription: string;

  @Prop([String])
  ArchitecturalStyle: string[];

  @Prop([String])
  DocumentsAvailable: string[];

  @Prop()
  MainLevelBathrooms: number;

  @Prop()
  OffMarketTimestamp: Date;

  @Prop()
  PropertyAttachedYN: boolean;

  @Prop([String])
  WaterfrontFeatures: string[];

  @Prop()
  YearBuiltEffective: Date;

  @Prop()
  BathroomsOneQuarter: number;

  @Prop()
  StreetNumberNumeric: number;

  @Prop()
  TaxLegalDescription: string;

  @Prop([String])
  AssociationAmenities: string[];

  @Prop()
  ElectricOnPropertyYN: boolean;

  @Prop([String])
  AccessibilityFeatures: string[];

  @Prop()
  BathroomsThreeQuarter: number;

  @Prop()
  BathroomsTotalDecimal: number;

  @Prop([String])
  PatioAndPorchFeatures: string[];
}

export const PropertyQuerySchema = SchemaFactory.createForClass(PropertyQuery);
