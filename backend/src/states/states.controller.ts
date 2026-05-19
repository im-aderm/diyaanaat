import {
  Controller, Get, Post, Param, Body, UseGuards,
} from '@nestjs/common';
import { StatesService } from './states.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('states')
export class StatesController {
  constructor(private statesService: StatesService) {}

  @Public()
  @Get()
  findAll() {
    return this.statesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statesService.findById(id);
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  seed() {
    return this.statesService.seedNigerianStates();
  }

  @Get(':id/lgas')
  findLgas(@Param('id') id: string) {
    return this.statesService.findLgasByState(id);
  }

  @Post(':id/lgas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  createLga(@Param('id') id: string, @Body('name') name: string) {
    return this.statesService.createLga(id, name);
  }
}
