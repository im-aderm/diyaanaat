import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateSupplierDto {
  @IsUUID('4')
  centerId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUUID('4')
  stateId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUUID('4')
  stateId?: string;

  @IsOptional()
  @IsUUID('4')
  centerId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
