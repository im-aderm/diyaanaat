import {
  IsString, IsOptional, IsInt, IsEnum, IsUUID, IsNumber, IsDateString, Min,
} from 'class-validator';
import { CowStatus } from '@prisma/client';

export class CreateCowDto {
  @IsUUID('4')
  centerId: string;

  @IsUUID('4')
  supplierId: string;

  @IsUUID('4')
  sessionId: string;

  @IsString()
  tagNumber: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsNumber()
  purchaseCost?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedYield?: number;

  @IsOptional()
  @IsString()
  healthStatus?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCowDto {
  @IsOptional()
  @IsUUID('4')
  supplierId?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsNumber()
  purchaseCost?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedYield?: number;

  @IsOptional()
  @IsString()
  healthStatus?: string;

  @IsOptional()
  @IsEnum(CowStatus)
  status?: CowStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
