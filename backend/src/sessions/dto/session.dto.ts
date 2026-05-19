import {
  IsString, IsInt, IsDateString, IsEnum, IsOptional, Min, IsUUID,
} from 'class-validator';
import { SessionStatus } from '@prisma/client';

export class CreateSessionDto {
  @IsInt()
  @Min(2024)
  gregorianYear: number;

  @IsInt()
  @Min(1400)
  hijriYear: number;

  @IsString()
  name: string;

  @IsDateString()
  registrationOpenDate: string;

  @IsDateString()
  registrationCloseDate: string;

  @IsDateString()
  distributionStartDate: string;

  @IsDateString()
  distributionEndDate: string;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  registrationOpenDate?: string;

  @IsOptional()
  @IsDateString()
  registrationCloseDate?: string;

  @IsOptional()
  @IsDateString()
  distributionStartDate?: string;

  @IsOptional()
  @IsDateString()
  distributionEndDate?: string;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}
