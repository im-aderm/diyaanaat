import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  getDashboard(
    @Query('sessionId') sessionId?: string,
    @Query('centerId') centerId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.reportingService.getDashboardStats(sessionId, centerId, user);
  }

  @Get('beneficiaries')
  @Roles('SUPER_ADMIN')
  getBeneficiaryReport(
    @Query('sessionId') sessionId?: string,
    @Query('centerId') centerId?: string,
    @Query('stateId') stateId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.reportingService.getBeneficiaryReport({
      sessionId,
      centerId,
      stateId,
    }, user);
  }

  @Get('inventory')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  getInventoryReport(
    @Query('centerId') centerId?: string,
    @Query('sessionId') sessionId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.reportingService.getInventoryReport({ centerId, sessionId }, user);
  }

  @Get('geographic')
  @Roles('SUPER_ADMIN')
  getGeographicReport(
    @Query('sessionId') sessionId?: string,
    @Query('centerId') centerId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.reportingService.getGeographicReport(sessionId, centerId, user);
  }
}
