import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  getDashboard(
    @Query('sessionId') sessionId?: string,
    @Query('centerId') centerId?: string,
  ) {
    return this.reportingService.getDashboardStats(sessionId, centerId);
  }

  @Get('beneficiaries')
  @Roles('SUPER_ADMIN')
  getBeneficiaryReport(
    @Query('sessionId') sessionId?: string,
    @Query('centerId') centerId?: string,
    @Query('stateId') stateId?: string,
  ) {
    return this.reportingService.getBeneficiaryReport({
      sessionId,
      centerId,
      stateId,
    });
  }

  @Get('inventory')
  @Roles('SUPER_ADMIN', 'CENTER_ADMIN')
  getInventoryReport(
    @Query('centerId') centerId?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.reportingService.getInventoryReport({ centerId, sessionId });
  }

  @Get('geographic')
  @Roles('SUPER_ADMIN')
  getGeographicReport(@Query('sessionId') sessionId?: string) {
    return this.reportingService.getGeographicReport(sessionId);
  }
}
