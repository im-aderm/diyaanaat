import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('centerId') centerId?: string,
  ) {
    return this.suppliersService.findAll({
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
      centerId,
    });
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findById(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }
}
