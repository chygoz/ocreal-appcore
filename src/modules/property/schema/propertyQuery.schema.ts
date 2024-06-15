import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schema/user.schema';
import { Agent } from 'supertest';

@Schema()
export class Media extends Document {
  @Prop()
  Order: number;

  @Prop()
  MediaURL: string;

  @Prop()
  MimeType: string;

  @Prop()
  ClassName: string;

  @Prop()
  ResourceName: string;

  @Prop()
  MediaCategory: string;

  @Prop()
  MediaObjectID: string;

  @Prop()
  ShortDescription: string;

  @Prop()
  ResourceRecordKey: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

@Schema()
export class PropertyQuery extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  agent: Agent;

  @Prop()
  ListingKey: string;

  @Prop()
  ModificationTimestamp: string;

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

  @Prop({ type: Number, required: false })
  LotSizeArea: number | null;

  @Prop({ type: Number, required: false })
  LotSizeAcres: number | null;

  @Prop()
  LivingArea: number;

  @Prop()
  BuildingAreaTotal: number;

  @Prop()
  ListAgentFullName: string;

  @Prop()
  ListAgentMlsId: string;

  @Prop()
  ListOfficeMlsId: string;

  @Prop()
  ListOfficeName: string;

  @Prop({ type: String, required: false })
  OriginatingSystemName: string | null;

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

  @Prop({ type: [MediaSchema] })
  Media: Media[];

  @Prop({ type: String, required: false })
  UnparsedAddress: string | null;

  @Prop()
  PublicRemarks: string;

  @Prop([String])
  Gas: string[];

  @Prop({ type: String, required: false })
  DOH1: string | null;

  @Prop({ type: String, required: false })
  DOH2: string | null;

  @Prop({ type: String, required: false })
  DOH3: string | null;

  @Prop({ type: String, required: false })
  Make: string | null;

  @Prop([String])
  Roof: string[];

  @Prop([String])
  View: string[];

  @Prop({ type: String, required: false })
  Model: string | null;

  @Prop([String])
  Sewer: string[];

  @Prop([String])
  Skirt: string[];

  @Prop()
  SpaYN: boolean;

  @Prop([String])
  Levels: string[];

  @Prop({ type: String, required: false })
  MapURL: string | null;

  @Prop()
  TaxLot: string;

  @Prop()
  ViewYN: boolean;

  @Prop()
  Zoning: string;

  @Prop({ type: Number, required: false })
  CapRate: number | null;

  @Prop([String])
  Cooling: string[];

  @Prop()
  Country: string;

  @Prop([String])
  Fencing: string[];

  @Prop([String])
  Heating: string[];

  @Prop()
  HorseYN: boolean;

  @Prop({ type: String, required: false })
  ListAOR: string | null;

  @Prop({ type: String, required: false })
  SerialU: string | null;

  @Prop({ type: String, required: false })
  SerialX: string | null;

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

  @Prop({ type: String, required: false })
  License1: string | null;

  @Prop({ type: String, required: false })
  License2: string | null;

  @Prop({ type: String, required: false })
  License3: string | null;

  @Prop({ type: String, required: false })
  MaloneId: string | null;

  @Prop({ type: String, required: false })
  ParkName: string | null;

  @Prop({ type: String, required: false })
  RoomType: string | null;

  @Prop({ type: String, required: false })
  SerialXX: string | null;

  @Prop()
  TaxBlock: string;

  @Prop()
  TaxTract: string;

  @Prop({ type: String, required: false })
  Township: string | null;

  @Prop()
  '@odata.id': string;

  @Prop()
  CarportYN: boolean;

  @Prop({ type: Date, required: false })
  CloseDate: Date | null;

  @Prop()
  CoolingYN: boolean;

  @Prop()
  Elevation: number;

  @Prop({ type: String, required: false })
  Furnished: string | null;

  @Prop()
  HeatingYN: boolean;

  @Prop({ type: String, required: false })
  LeaseTerm: string | null;

  @Prop()
  MlsStatus: string;

  @Prop({ type: String, required: false })
  OwnerName: string | null;

  @Prop([String])
  OwnerPays: string[];

  @Prop()
  Ownership: string;

  @Prop({ type: String, required: false })
  RangeArea: string | null;

  @Prop([String])
  Telephone: string[];

  @Prop([String])
  Utilities: string[];

  @Prop({ type: Number, required: false })
  WalkScore: number | null;

  @Prop()
  AccessCode: string;

  @Prop([String])
  Appliances: string[];

  @Prop()
  CityRegion: string;

  @Prop({ type: Number, required: false })
  ClosePrice: number | null;

  @Prop([String])
  CurrentUse: string[];

  @Prop()
  Directions: string;

  @Prop()
  Disclaimer: string;

  @Prop({ type: Number, required: false })
  EntryLevel: number | null;

  @Prop()
  Exclusions: string;

  @Prop()
  HighSchool: string;

  @Prop()
  Inclusions: string;

  @Prop({ type: String, required: false })
  OwnerPhone: string | null;

  @Prop([String])
  Possession: string[];

  @Prop({ type: String, required: false })
  PostalCity: string | null;

  @Prop()
  RoomsTotal: number;

  @Prop({ type: String, required: false })
  StreetName: string | null;

  @Prop([String])
  TenantPays: string[];

  @Prop({ type: String, required: false })
  Topography: string | null;

  @Prop({ type: String, required: false })
  UnitNumber: string | null;

  @Prop([String])
  Vegetation: string[];

  @Prop({ type: Number, required: false })
  WoodedArea: number | null;

  @Prop()
  BuilderName: string;

  @Prop([String])
  CommonWalls: string[];

  @Prop({ type: String, required: false })
  Concessions: string | null;

  @Prop()
  Contingency: string;

  @Prop({ type: String, required: false })
  CrossStreet: string | null;

  @Prop([String])
  Disclosures: string[];

  @Prop()
  FireplaceYN: boolean;

  @Prop({ type: Number, required: false })
  FuelExpense: number | null;

  @Prop({ type: Number, required: false })
  GrossIncome: number | null;

  @Prop()
  LandLeaseYN: boolean;

  @Prop({ type: Number, required: false })
  LeaseAmount: number | null;

  @Prop({ type: String, required: false })
  ListTeamKey: string | null;

  @Prop([String])
  LockBoxType: string[];

  @Prop([String])
  LotFeatures: string[];

  @Prop({ type: Number, required: false })
  MobileWidth: number | null;

  @Prop({ type: Number, required: false })
  PastureArea: number | null;

  @Prop([String])
  PetsAllowed: string[];

  @Prop()
  PhotosCount: number;

  @Prop({ type: Number, required: false })
  PoolExpense: number | null;

  @Prop([String])
  PossibleUse: string[];

  @Prop({ type: Number, required: false })
  ShowingDays: number | null;

  @Prop([String])
  SpaFeatures: string[];

  @Prop({ type: String, required: false })
  TaxLegalDescription: string | null;

  @Prop({ type: Number, required: false })
  TotalExpenses: number | null;

  @Prop()
  YearBuiltDetails: string;

  @Prop({ type: String, required: false })
  YearBuiltEffective: string | null;

  @Prop({ type: Date, required: false })
  ShowingEndTime: Date | null;

  @Prop({ type: String, required: false })
  SourceSystemID: string | null;

  @Prop({ type: String, required: false })
  UnitsFurnished: string | null;

  @Prop({ type: [String] })
  WindowFeatures: string[];

  @Prop({ type: Number })
  AssociationFee2: number;

  @Prop({ type: String })
  AssociationName: string;

  @Prop({ type: String, required: false })
  BuyerAgentEmail: string | null;

  @Prop({ type: String, required: false })
  BuyerAgentMlsId: string | null;

  @Prop({ type: String, required: false })
  BuyerAgentPager: string | null;

  @Prop({ type: String, required: false })
  BuyerOfficeName: string | null;

  @Prop({ type: Date, required: false })
  CancelationDate: Date | null;

  @Prop({ type: String, required: false })
  CoBuyerAgentAOR: string | null;

  @Prop({ type: String, required: false })
  CoBuyerAgentFax: string | null;

  @Prop({ type: String, required: false })
  CoBuyerAgentKey: string | null;

  @Prop({ type: String, required: false })
  CoBuyerAgentURL: string | null;

  @Prop({ type: String, required: false })
  CoListOfficeAOR: string | null;

  @Prop({ type: String, required: false })
  CoListOfficeFax: string | null;

  @Prop({ type: String, required: false })
  CoListOfficeKey: string | null;

  @Prop({ type: String, required: false })
  CoListOfficeURL: string | null;

  @Prop({ type: String, required: false })
  ContinentRegion: string | null;

  @Prop()
  CopyrightNotice: string;

  @Prop({ type: Boolean, required: false })
  CropsIncludedYN: boolean | null;

  @Prop({ type: Number, required: false })
  ElectricExpense: number | null;

  @Prop()
  FireplacesTotal: number;

  @Prop({ type: Number, required: false })
  GardenerExpense: number | null;

  @Prop()
  LandLeaseAmount: number;

  @Prop({ type: [String] })
  LaundryFeatures: string[];

  @Prop({ type: Date, required: false })
  LeaseExpiration: Date | null;

  @Prop({ type: Number, required: false })
  LicensesExpense: number | null;

  @Prop({ type: String, required: false })
  ListOfficeEmail: string | null;

  @Prop({ type: String, required: false })
  ListOfficePhone: string | null;

  @Prop()
  LivingAreaUnits: string;

  @Prop()
  LockBoxLocation: string;

  @Prop()
  MajorChangeType: string;

  @Prop({ type: Number, required: false })
  NewTaxesExpense: number | null;

  @Prop({ type: [String] })
  OtherStructures: string[];

  @Prop({ type: String, required: false })
  ParkManagerName: string | null;

  @Prop({ type: [String] })
  ParkingFeatures: string[];

  @Prop({ type: String, required: false })
  PostalCodePlus4: string | null;

  @Prop({ type: [String] })
  RoadSurfaceType: string[];

  @Prop({ type: Number, required: false })
  SeatingCapacity: number | null;

  @Prop({ type: String, required: false })
  SourceSystemKey: string | null;

  @Prop({ type: [String] })
  SpecialLicenses: string[];

  @Prop()
  StateOrProvince: string;

  @Prop({ type: String, required: false })
  StreetDirPrefix: string | null;

  @Prop({ type: String, required: false })
  StreetDirSuffix: string | null;

  @Prop()
  SubdivisionName: string;

  @Prop({ type: Number, required: false })
  SuppliesExpense: number | null;

  @Prop()
  TaxAnnualAmount: number;

  @Prop({ type: String, required: false })
  TaxParcelLetter: string | null;

  @Prop({ type: Number, required: false })
  TotalActualRent: number | null;

  @Prop()
  YearBuiltSource: string;

  @Prop({ type: Date, required: false })
  YearEstablished: Date | null;

  @Prop()
  AnchorsCoTenants: string;

  @Prop()
  AssociationName2: string;

  @Prop()
  AssociationPhone: string;

  @Prop()
  AttachedGarageYN: boolean;

  @Prop()
  AvailabilityDate: Date;

  @Prop()
  BathroomsPartial: number;

  @Prop()
  BedroomsPossible: number;

  @Prop({ type: [String] })
  BuildingFeatures: string[];

  @Prop({ type: String, required: false })
  BuyerOfficeEmail: string | null;

  @Prop({ type: String, required: false })
  BuyerOfficeMlsId: string | null;

  @Prop({ type: String, required: false })
  BuyerOfficePhone: string | null;

  @Prop({ type: String, required: false })
  CoBuyerOfficeAOR: string | null;

  @Prop({ type: String, required: false })
  CoBuyerOfficeFax: string | null;

  @Prop({ type: String, required: false })
  CoBuyerOfficeKey: string | null;

  @Prop({ type: String, required: false })
  CoBuyerOfficeURL: string | null;

  @Prop({ type: [String] })
  CurrentFinancing: string[];

  @Prop()
  ElementarySchool: string;

  @Prop({ type: [String] })
  ExteriorFeatures: string[];

  @Prop({ type: Number, required: false })
  InsuranceExpense: number | null;

  @Prop({ type: [String] })
  InteriorFeatures: string[];

  @Prop({ type: [String] })
  IrrigationSource: string[];

  @Prop({ type: [String] })
  LaborInformation: string[];

  @Prop({ type: String, required: false })
  ListingAgreement: string | null;

  @Prop()
  LivingAreaSource: string;

  @Prop({ type: Number, required: false })
  OperatingExpense: number | null;

  @Prop({ type: String, required: false })
  ParkManagerPhone: string | null;

  @Prop()
  PendingTimestamp: Date;

  @Prop({ type: [String] })
  RoadFrontageType: string[];

  @Prop({ type: [String] })
  SecurityFeatures: string[];

  @Prop({ type: Date, required: false })
  ShowingStartTime: Date | null;

  @Prop()
  SignOnPropertyYN: boolean;

  @Prop({ type: String, required: false })
  SourceSystemName: string | null;

  @Prop()
  TaxAssessedValue: number;

  @Prop({ type: [String] })
  TaxStatusCurrent: string[];

  @Prop({ type: Number, required: false })
  VacancyAllowance: number | null;

  @Prop()
  AssociationPhone2: string;

  @Prop()
  BuildingAreaUnits: string;

  @Prop({ type: String, required: false })
  CoBuyerAgentEmail: string | null;

  @Prop({ type: String, required: false })
  CoBuyerAgentMlsId: string | null;

  @Prop({ type: String, required: false })
  CoBuyerAgentPager: string | null;

  @Prop({ type: String, required: false })
  CoBuyerOfficeName: string | null;

  @Prop({ type: String, required: false })
  CoListOfficeEmail: string | null;

  @Prop({ type: String, required: false })
  CoListOfficeMlsId: string | null;

  @Prop({ type: String, required: false })
  CoListOfficePhone: string | null;

  @Prop({ type: [String] })
  CommunityFeatures: string[];

  @Prop({ type: Number, required: false })
  ConcessionsAmount: number | null;

  @Prop({ type: [String] })
  DevelopmentStatus: string[];

  @Prop({ type: [String] })
  ExistingLeaseType: string[];

  @Prop({ type: String, required: false })
  FarmLandAreaUnits: string | null;

  @Prop({ type: [String] })
  FireplaceFeatures: string[];

  @Prop({ type: [String] })
  FoundationDetails: string[];

  @Prop({ type: String, required: false })
  LeasableAreaUnits: string | null;

  @Prop({ type: Boolean, required: false })
  LeaseAssignableYN: boolean | null;

  @Prop()
  LeaseConsideredYN: boolean;

  @Prop()
  ListAgentLastName: string;

  @Prop({ type: Number, required: false })
  ListingKeyNumeric: number | null;

  @Prop()
  LotSizeDimensions: string;

  @Prop()
  LotSizeSquareFeet: number;

  @Prop({ type: Number, required: false })
  MainLevelBedrooms: number | null;

  @Prop()
  NewConstructionYN: boolean;

  @Prop({ type: Number, required: false })
  NumberOfBuildings: number | null;

  @Prop({ type: Number, required: false })
  NumberOfUnitsMoMo: number | null;

  @Prop({ type: Date, required: false })
  OnMarketTimestamp: Date | null;

  @Prop({ type: Number, required: false })
  OpenParkingSpaces: number | null;

  @Prop()
  OriginalListPrice: number;

  @Prop()
  PreviousListPrice: number;

  @Prop({ type: [String] })
  PropertyCondition: string[];

  @Prop({ type: String, required: false })
  PublicSurveyRange: string | null;

  @Prop()
  SeniorCommunityYN: boolean;

  @Prop({ type: Boolean, required: false })
  ShowingAttendedYN: boolean | null;

  @Prop({ type: Number, required: false })
  WaterSewerExpense: number | null;

  @Prop({ type: Number, required: false })
  YearsCurrentOwner: number | null;

  @Prop()
  ZoningDescription: string;

  @Prop({ type: [String] })
  ArchitecturalStyle: string[];

  @Prop()
  BuildingAreaSource: string;

  @Prop({ type: String, required: false })
  BuyerAgentFullName: string | null;

  @Prop({ type: String, required: false })
  BuyerAgentLastName: string | null;

  @Prop({ type: String, required: false })
  CoBuyerOfficeEmail: string | null;

  @Prop({ type: String, required: false })
  CoBuyerOfficeMlsId: string | null;

  @Prop({ type: String, required: false })
  CoBuyerOfficePhone: string | null;

  @Prop({ type: Number, required: false })
  DistanceToBusUnits: number | null;

  @Prop({ type: Number, required: false })
  DistanceToGasUnits: number | null;

  @Prop({ type: [String] })
  DocumentsAvailable: string[];

  @Prop({ type: String, required: false })
  FarmLandAreaSource: string | null;

  @Prop()
  HighSchoolDistrict: string;

  @Prop()
  IDXParticipationYN: boolean;

  @Prop({ type: String, required: false })
  ListAgentCellPhone: string | null;

  @Prop()
  ListAgentFirstName: string;

  @Prop({ type: String, required: false })
  ListAgentHomePhone: string | null;

  @Prop({ type: String, required: false })
  ListAgentVoiceMail: string | null;

  @Prop({ type: String, required: false })
  ListOfficePhoneExt: string | null;

  @Prop({ type: Number, required: false })
  ListTeamKeyNumeric: number | null;

  @Prop()
  MainLevelBathrooms: number;

  @Prop({ type: Number, required: false })
  MaintenanceExpense: number | null;

  @Prop({ type: Number, required: false })
  NetOperatingIncome: number | null;

  @Prop()
  NumberOfUnitsTotal: number;

  @Prop({ type: Date, required: false })
  OffMarketTimestamp: Date | null;

  @Prop({ type: Number, required: false })
  PestControlExpense: number | null;

  @Prop()
  PropertyAttachedYN: boolean;

  @Prop({ type: [String] })
  RoadResponsibility: string[];

  @Prop()
  ShowingContactName: string;

  @Prop({ type: [String] })
  ShowingContactType: string[];

  @Prop({ type: String, required: false })
  SyndicationRemarks: string | null;

  @Prop({ type: [String] })
  WaterfrontFeatures: string[];

  @Prop()
  AdditionalParcelsYN: boolean;

  @Prop()
  BathroomsOneQuarter: number;

  @Prop({ type: String, required: false })
  BuyerAgentCellPhone: string | null;

  @Prop({ type: String, required: false })
  BuyerAgentFirstName: string | null;

  @Prop({ type: String, required: false })
  BuyerAgentHomePhone: string | null;

  @Prop({ type: String, required: false })
  BuyerAgentVoiceMail: string | null;

  @Prop({ type: String, required: false })
  BuyerOfficePhoneExt: string | null;

  @Prop({ type: Number, required: false })
  BuyerTeamKeyNumeric: number | null;

  @Prop({ type: String, required: false })
  CoListAgentFullName: string | null;

  @Prop({ type: String, required: false })
  CoListAgentLastName: string | null;

  @Prop({ type: String, required: false })
  ConcessionsComments: string | null;

  @Prop({ type: [String] })
  FinancialDataSource: string[];

  @Prop({ type: Boolean, required: false })
  GrazingPermitsBlmYN: boolean | null;

  @Prop({ type: [String] })
  GreenSustainability: string[];

  @Prop({ type: Number, required: false })
  ListAgentKeyNumeric: number | null;

  @Prop()
  ListAgentMiddleName: string;

  @Prop({ type: String, required: false })
  ListAgentNamePrefix: string | null;

  @Prop({ type: String, required: false })
  ListAgentNameSuffix: string | null;

  @Prop()
  ListingContractDate: Date;

  @Prop()
  LockBoxSerialNumber: string;

  @Prop()
  LotDimensionsSource: string;

  @Prop({ type: String, required: false })
  MapCoordinateSource: string | null;

  @Prop({ type: Boolean, required: false })
  MobileHomeRemainsYN: boolean | null;

  @Prop({ type: Number, required: false })
  NumberOfUnitsLeased: number | null;

  @Prop({ type: Number, required: false })
  NumberOfUnitsVacant: number | null;

  @Prop()
  OriginatingSystemID: string;

  @Prop({ type: [String], required: false })
  PowerProductionType: string[] | null;

  @Prop({ type: String, required: false })
  PropertyUniversalID: string | null;

  @Prop({ type: String, required: false })
  PublicSurveySection: string | null;

  @Prop({ type: [String], required: false })
  RVParkingDimensions: string[] | null;

  @Prop()
  ShowingContactPhone: string;

  @Prop()
  ShowingInstructions: string;

  @Prop({ type: String, required: false })
  ShowingRequirements: string | null;

  @Prop({ type: Number, required: false })
  StreetNumberNumeric: number | null;

  @Prop({ type: [String] })
  AssociationAmenities: string[];

  @Prop({ type: Number, required: false })
  BuyerAgentKeyNumeric: number | null;

  @Prop({ type: String, required: false })
  BuyerAgentMiddleName: string | null;

  @Prop({ type: String, required: false })
  BuyerAgentNamePrefix: string | null;

  @Prop({ type: String, required: false })
  BuyerAgentNameSuffix: string | null;

  @Prop({ type: String, required: false })
  CoBuyerAgentFullName: string | null;

  @Prop({ type: String, required: false })
  CoBuyerAgentLastName: string | null;

  @Prop({ type: String, required: false })
  CoListAgentCellPhone: string | null;

  @Prop({ type: String, required: false })
  CoListAgentFirstName: string | null;

  @Prop({ type: String, required: false })
  CoListAgentHomePhone: string | null;

  @Prop({ type: String, required: false })
  CoListAgentVoiceMail: string | null;

  @Prop({ type: String, required: false })
  CoListOfficePhoneExt: string | null;

  @Prop({ type: Number, required: false })
  DistanceToBusNumeric: number | null;

  @Prop({ type: Number, required: false })
  DistanceToGasNumeric: number | null;

  @Prop({ type: Number, required: false })
  DistanceToSewerUnits: number | null;

  @Prop({ type: Number, required: false })
  DistanceToWaterUnits: number | null;

  @Prop({ type: Boolean, required: false })
  ElectricOnPropertyYN: boolean | null;

  @Prop({ type: [String] })
  GreenEnergyEfficient: string[];

  @Prop({ type: Number, required: false })
  GrossScheduledIncome: number | null;

  @Prop({ type: Boolean, required: false })
  HabitableResidenceYN: boolean | null;

  @Prop({ type: [String] })
  HoursDaysOfOperation: string[];

  @Prop({ type: String, required: false })
  LeaseAmountFrequency: string | null;

  @Prop({ type: Boolean, required: false })
  LeaseRenewalOptionYN: boolean | null;

  @Prop({ type: [String] })
  ListAgentDesignation: string[];

  @Prop({ type: String, required: false })
  ListAgentDirectPhone: string | null;

  @Prop({ type: String, required: false })
  ListAgentMobilePhone: string | null;

  @Prop({ type: String, required: false })
  ListAgentOfficePhone: string | null;

  @Prop({ type: Number, required: false })
  ListOfficeKeyNumeric: number | null;

  @Prop({ type: Date, required: false })
  MajorChangeTimestamp: Date | null;

  @Prop()
  MiddleOrJuniorSchool: string;

  @Prop()
  OriginatingSystemKey: string;

  @Prop()
  PriceChangeTimestamp: Date;

  @Prop()
  PrivateOfficeRemarks: string;

  @Prop({ type: String, default: null })
  PublicSurveyTownship: string;

  @Prop({ type: Date, default: null })
  PurchaseContractDate: Date;

  @Prop({ type: String, default: null })
  ShowingAdvanceNotice: string;

  @Prop({ type: String, default: null })
  StreetAdditionalInfo: string;

  @Prop({ type: String, default: null })
  StreetSuffixModifier: string;

  @Prop({ type: Number, default: null })
  VacancyAllowanceRate: number;

  @Prop({ type: String, default: null })
  VirtualTourURLZillow: string;

  @Prop({ type: [String], default: [] })
  AccessibilityFeatures: string[];

  @Prop({ type: Number })
  BathroomsThreeQuarter: number;

  @Prop({ type: Number })
  BathroomsTotalDecimal: number;

  @Prop({ type: [String], default: [] })
  BuyerAgentDesignation: string[];

  @Prop({ type: String, default: null })
  BuyerAgentDirectPhone: string;

  @Prop({ type: String, default: null })
  BuyerAgentMobilePhone: string;

  @Prop({ type: String, default: null })
  BuyerAgentOfficePhone: string;

  @Prop({ type: Number, default: null })
  BuyerOfficeKeyNumeric: number;

  @Prop({ type: String, default: null })
  CoBuyerAgentCellPhone: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentFirstName: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentHomePhone: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentVoiceMail: string;

  @Prop({ type: String, default: null })
  CoBuyerOfficePhoneExt: string;

  @Prop({ type: Number, default: null })
  CoListAgentKeyNumeric: number;

  @Prop({ type: String, default: null })
  CoListAgentMiddleName: string;

  @Prop({ type: String, default: null })
  CoListAgentNamePrefix: string;

  @Prop({ type: String, default: null })
  CoListAgentNameSuffix: string;

  @Prop({ type: [String], default: [] })
  ConstructionMaterials: string[];

  @Prop({ type: String, default: null })
  DistanceToBusComments: string;

  @Prop({ type: String, default: null })
  DistanceToGasComments: string;

  @Prop({ type: String, default: null })
  DistanceToStreetUnits: string;

  @Prop({ type: [String], default: [] })
  GreenEnergyGeneration: string[];

  @Prop({ type: [String], default: [] })
  GreenIndoorAirQuality: string[];

  @Prop({ type: String, default: null })
  ListAgentStateLicense: string;

  @Prop({ type: String, default: null })
  ListAgentVoiceMailExt: string;

  @Prop({ type: [String], default: [] })
  PatioAndPorchFeatures: string[];

  @Prop({ type: Date, default: null })
  PhotosChangeTimestamp: Date;

  @Prop({ type: Date })
  StatusChangeTimestamp: Date;

  @Prop({ type: String, default: null })
  SubAgencyCompensation: string;

  @Prop({ type: Date, default: null })
  VideosChangeTimestamp: Date;

  @Prop({ type: String, default: null })
  VirtualTourURLBranded: string;

  @Prop({ type: Number })
  AboveGradeFinishedArea: number;

  @Prop({ type: [String], default: [] })
  AssociationFeeIncludes: string[];

  @Prop({ type: Number })
  BelowGradeFinishedArea: number;

  @Prop({ type: String, default: null })
  BuyerAgentStateLicense: string;

  @Prop({ type: String, default: null })
  BuyerAgentVoiceMailExt: string;

  @Prop({ type: Number, default: null })
  CoBuyerAgentKeyNumeric: number;

  @Prop({ type: String, default: null })
  CoBuyerAgentMiddleName: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentNamePrefix: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentNameSuffix: string;

  @Prop({ type: [String], default: [] })
  CoListAgentDesignation: string[];

  @Prop({ type: String, default: null })
  CoListAgentDirectPhone: string;

  @Prop({ type: String, default: null })
  CoListAgentMobilePhone: string;

  @Prop({ type: String, default: null })
  CoListAgentOfficePhone: string;

  @Prop({ type: Number, default: null })
  CoListOfficeKeyNumeric: number;

  @Prop({ type: Number, default: null })
  CumulativeDaysOnMarket: number;

  @Prop({ type: String, default: null })
  DistanceToFreewayUnits: string;

  @Prop({ type: String, default: null })
  DistanceToSchoolsUnits: string;

  @Prop({ type: Number, default: null })
  DistanceToSewerNumeric: number;

  @Prop({ type: Number, default: null })
  DistanceToWaterNumeric: number;

  @Prop({ type: [String], default: [] })
  GreenWaterConservation: string[];

  @Prop({ type: String, default: null })
  ListAgentTollFreePhone: string;

  @Prop({ type: Date })
  OriginalEntryTimestamp: Date;

  @Prop({ type: String, default: null })
  ShowingContactPhoneExt: string;

  @Prop({ type: String })
  AssociationFeeFrequency: string;

  @Prop({ type: String, default: null })
  BuyerAgencyCompensation: string;

  @Prop({ type: String, default: null })
  BuyerAgentTollFreePhone: string;

  @Prop({ type: [String], default: [] })
  CoBuyerAgentDesignation: string[];

  @Prop({ type: String, default: null })
  CoBuyerAgentDirectPhone: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentMobilePhone: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentOfficePhone: string;

  @Prop({ type: Number, default: null })
  CoBuyerOfficeKeyNumeric: number;

  @Prop({ type: String, default: null })
  CoListAgentStateLicense: string;

  @Prop({ type: String, default: null })
  CoListAgentVoiceMailExt: string;

  @Prop({ type: String, default: null })
  DistanceToElectricUnits: string;

  @Prop({ type: String, default: null })
  DistanceToSewerComments: string;

  @Prop({ type: String, default: null })
  DistanceToShoppingUnits: string;

  @Prop({ type: Number, default: null })
  DistanceToStreetNumeric: number;

  @Prop({ type: String, default: null })
  DistanceToWaterComments: string;

  @Prop({ type: String, default: null })
  FarmCreditServiceInclYN: string;

  @Prop({ type: String, default: null })
  GrazingPermitsPrivateYN: string;

  @Prop({ type: String, default: null })
  IrrigationWaterRightsYN: string;

  @Prop({ type: Date, default: null })
  LandLeaseExpirationDate: Date;

  @Prop({ type: String, default: null })
  ListAgentOfficePhoneExt: string;

  @Prop({ type: String })
  ListAgentPreferredPhone: string;

  @Prop({ type: String, default: null })
  VirtualTourURLUnbranded: string;

  @Prop({ type: String })
  AssociationFee2Frequency: string;

  @Prop({ type: String, default: null })
  BuyerAgentOfficePhoneExt: string;

  @Prop({ type: String, default: null })
  BuyerAgentPreferredPhone: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentStateLicense: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentVoiceMailExt: string;

  @Prop({ type: String, default: null })
  CoListAgentTollFreePhone: string;

  @Prop({ type: Date })
  ContractStatusChangeDate: Date;

  @Prop({ type: Number, default: null })
  DistanceToFreewayNumeric: number;

  @Prop({ type: String, default: null })
  DistanceToSchoolBusUnits: string;

  @Prop({ type: Number, default: null })
  DistanceToSchoolsNumeric: number;

  @Prop({ type: String, default: null })
  DistanceToStreetComments: string;

  @Prop({ type: Date, default: null })
  DocumentsChangeTimestamp: Date;

  @Prop({ type: String })
  ElementarySchoolDistrict: string;

  @Prop({ type: String, default: null })
  LandLeaseAmountFrequency: string;

  @Prop({ type: [String], default: [] })
  LeaseRenewalCompensation: string[];

  @Prop({ type: Number, default: null })
  NumberOfUnitsInCommunity: number;

  @Prop({ type: [String], default: [] })
  OperatingExpenseIncludes: string[];

  @Prop({ type: [String], default: [] })
  SpecialListingConditions: string[];

  @Prop({ type: String, default: null })
  CoBuyerAgentTollFreePhone: string;

  @Prop({ type: String, default: null })
  CoListAgentOfficePhoneExt: string;

  @Prop({ type: String, default: null })
  CoListAgentPreferredPhone: string;

  @Prop({ type: Number, default: null })
  DistanceToElectricNumeric: number;

  @Prop({ type: String, default: null })
  DistanceToFreewayComments: string;

  @Prop({ type: String, default: null })
  DistanceToSchoolsComments: string;

  @Prop({ type: Number, default: null })
  DistanceToShoppingNumeric: number;

  @Prop({ type: Boolean })
  InternetConsumerCommentYN: boolean;

  @Prop({ type: String, default: null })
  ListingInputOriginalMedia: string;

  @Prop({ type: Number, default: null })
  NumberOfFullTimeEmployees: number;

  @Prop({ type: Number, default: null })
  NumberOfPartTimeEmployees: number;

  @Prop({ type: Number, default: null })
  NumberOfSeparateGasMeters: number;

  @Prop({ type: String, default: null })
  SubAgencyCompensationType: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentOfficePhoneExt: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentPreferredPhone: string;

  @Prop({ type: String, default: null })
  DistanceToElectricComments: string;

  @Prop({ type: Number, default: null })
  DistanceToSchoolBusNumeric: number;

  @Prop({ type: String, default: null })
  DistanceToShoppingComments: string;

  @Prop({ type: Boolean })
  DualVariableCompensationYN: boolean;

  @Prop({ type: Number, default: null })
  IrrigationWaterRightsAcres: number;

  @Prop({ type: String, default: null })
  ListAgentPreferredPhoneExt: string;

  @Prop({ type: String })
  AboveGradeFinishedAreaUnits: string;

  @Prop({ type: String })
  BelowGradeFinishedAreaUnits: string;

  @Prop({ type: Date })
  BridgeModificationTimestamp: Date;

  @Prop({ type: String, default: null })
  BuyerAgencyCompensationType: string;

  @Prop({ type: String, default: null })
  BuyerAgentPreferredPhoneExt: string;

  @Prop({ type: String, default: null })
  DistanceToPhoneServiceUnits: string;

  @Prop({ type: String, default: null })
  DistanceToSchoolBusComments: string;

  @Prop({ type: Number, default: null })
  FurnitureReplacementExpense: number;

  @Prop({ type: Number, default: null })
  NumberOfSeparateWaterMeters: number;

  @Prop({ type: Number, default: null })
  WorkmansCompensationExpense: number;

  @Prop({ type: String })
  AboveGradeFinishedAreaSource: string;

  @Prop({ type: String, default: null })
  AdditionalParcelsDescription: string;

  @Prop({ type: String })
  BelowGradeFinishedAreaSource: string;

  @Prop({ type: String, default: null })
  CoListAgentPreferredPhoneExt: string;

  @Prop({ type: String })
  MiddleOrJuniorSchoolDistrict: string;

  @Prop({ type: String, default: null })
  CoBuyerAgentPreferredPhoneExt: string;

  @Prop({ type: Number, default: null })
  DistanceToPhoneServiceNumeric: number;

  @Prop({ type: String, default: null })
  DistanceToPlaceofWorshipUnits: string;

  @Prop({ type: String, default: null })
  GrazingPermitsForestServiceYN: string;

  @Prop({ type: String, default: null })
  GreenBuildingVerificationType: string;

  @Prop({ type: Number, default: null })
  ProfessionalManagementExpense: number;

  @Prop({ type: String, default: null })
  TransactionBrokerCompensation: string;

  @Prop({ type: String, default: null })
  DistanceToPhoneServiceComments: string;

  @Prop({ type: Boolean })
  InternetEntireListingDisplayYN: boolean;

  @Prop({ type: Number, default: null })
  NumberOfSeparateElectricMeters: number;

  @Prop({ type: Number, default: null })
  TaxOtherAnnualAssessmentAmount: number;

  @Prop({ type: Number, default: null })
  DistanceToPlaceofWorshipNumeric: number;

  @Prop({ type: String, default: null })
  HoursDaysOfOperationDescription: string;

  @Prop({ type: String, default: null })
  DistanceToPlaceofWorshipComments: string;

  @Prop({ type: String, default: null })
  TransactionBrokerCompensationType: string;

  @Prop({ type: Boolean })
  InternetAutomatedValuationDisplayYN: boolean;
}

export const PropertyQuerySchema = SchemaFactory.createForClass(PropertyQuery);
