import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { CowsService } from './cows.service';
import { CreateCowDto, UpdateCowDto } from './dto/cow.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CenterGuard } from '../common/guards/center.guard';

@Controller('cows')
@UseGuards(JwtAuthGuard, RolesGuard, CenterGuard)
export class CowsController {
  constructor(private cowsService: CowsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('centerId') centerId?: string,
    @Query('sessionId') sessionId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    return this.cowsService.findAll({
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
      centerId,
      sessionId,
      supplierId,
      status,
    });
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  getStats(
    @Query('centerId') centerId?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.cowsService.getInventoryStats({ centerId, sessionId });
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.cowsService.findById(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  create(@Body() dto: CreateCowDto) {
    return this.cowsService.create(dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateCowDto) {
    return this.cowsService.update(id, dto);
  }
}
