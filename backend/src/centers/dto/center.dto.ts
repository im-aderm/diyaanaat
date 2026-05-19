import {
  IsString, IsOptional, IsBoolean, IsArray, IsUUID,
} from 'class-validator';

export class CreateCenterDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  stateIds?: string[];
}

export class UpdateCenterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignStatesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  stateIds: string[];
}
