import {
  IsString, IsOptional, IsInt, IsEnum, IsUUID, Min, Max, IsPhoneNumber,
} from 'class-validator';
import {
  BeneficiaryType, OrganizationType, DistributionDay,
} from '@prisma/client';

export class RegisterBeneficiaryDto {
  @IsEnum(BeneficiaryType)
  type: BeneficiaryType;

  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  address: string;

  @IsUUID('4')
  stateId: string;

  @IsUUID('4')
  lgaId: string;

  @IsOptional()
  @IsString()
  vulnerabilityCategory?: string;

  @IsOptional()
  @IsEnum(OrganizationType)
  organizationType?: OrganizationType;

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  guarantorName?: string;

  @IsOptional()
  @IsString()
  guarantorPhone?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  requestedSlots: number;

  @IsOptional()
  isFirstTime?: boolean;
}

export class ApproveBeneficiaryDto {
  @IsInt()
  @Min(1)
  approvedSlots: number;

  @IsEnum(DistributionDay)
  distributionDay: DistributionDay;

  @IsString()
  distributionTime: string;
}

export class RejectBeneficiaryDto {
  @IsString()
  rejectionReason: string;
}

export class VerifyCodeDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CollectDto {
  @IsString()
  code: string;
}
