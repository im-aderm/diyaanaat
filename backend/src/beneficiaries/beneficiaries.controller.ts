import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import {
  RegisterBeneficiaryDto, ApproveBeneficiaryDto,
  RejectBeneficiaryDto,
} from './dto/beneficiary.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CenterGuard } from '../common/guards/center.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('beneficiaries')
@UseGuards(JwtAuthGuard, RolesGuard, CenterGuard)
export class BeneficiariesController {
  constructor(private beneficiariesService: BeneficiariesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('centerId') centerId?: string,
    @Query('sessionId') sessionId?: string,
    @Query('search') search?: string,
    @Query('stateId') stateId?: string,
    @Query('distributionDay') distributionDay?: string,
  ) {
    return this.beneficiariesService.findAll({
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
      status,
      centerId,
      sessionId,
      search,
      stateId,
      distributionDay,
    });
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  findByCode(@Param('code') code: string) {
    return this.beneficiariesService.findByCode(code);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.beneficiariesService.findById(id);
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterBeneficiaryDto) {
    return this.beneficiariesService.register(dto);
  }

  @Patch(':id/approve')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveBeneficiaryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.beneficiariesService.approve(id, dto, userId);
  }

  @Patch(':id/reject')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectBeneficiaryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.beneficiariesService.reject(id, dto, userId);
  }

  @Patch(':id/slots')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  updateSlots(
    @Param('id') id: string,
    @Body('approvedSlots') approvedSlots: number,
    @CurrentUser('id') userId: string,
  ) {
    return this.beneficiariesService.updateSlots(id, approvedSlots, userId);
  }
}
