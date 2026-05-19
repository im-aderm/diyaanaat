import {
  Controller, Post, Get, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { DistributionService } from './distribution.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { VerifyCodeDto, CollectDto } from '../beneficiaries/dto/beneficiary.dto';

@Controller('distribution')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DistributionController {
  constructor(private distributionService: DistributionService) {}

  @Post('verify-code')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  verifyCode(
    @Body() dto: VerifyCodeDto,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    return this.distributionService.verifyCode(dto.code, userId, ipAddress);
  }

  @Post('collect')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  collect(
    @Body() dto: CollectDto,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    return this.distributionService.collect(dto.code, userId, ipAddress);
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  getStats(
    @Query('sessionId') sessionId?: string,
    @Query('centerId') centerId?: string,
    @Query('distributionDay') distributionDay?: string,
  ) {
    return this.distributionService.getCollectionStats({
      sessionId,
      centerId,
      distributionDay,
    });
  }
}
