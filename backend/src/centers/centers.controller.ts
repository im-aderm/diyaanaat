import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { CentersService } from './centers.service';
import { CreateCenterDto, UpdateCenterDto, AssignStatesDto } from './dto/center.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('centers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CentersController {
  constructor(private centersService: CentersService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  findAll() {
    return this.centersService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.centersService.findById(id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() dto: CreateCenterDto) {
    return this.centersService.create(dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateCenterDto) {
    return this.centersService.update(id, dto);
  }

  @Post(':id/states')
  @Roles('SUPER_ADMIN')
  assignStates(@Param('id') id: string, @Body() dto: AssignStatesDto) {
    return this.centersService.assignStates(id, dto.stateIds);
  }

  @Delete(':id/states/:stateId')
  @Roles('SUPER_ADMIN')
  removeState(@Param('id') id: string, @Param('stateId') stateId: string) {
    return this.centersService.removeState(id, stateId);
  }
}
