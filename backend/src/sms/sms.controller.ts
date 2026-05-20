import {
  Controller, Get, Post, Body, Query, UseGuards,
} from '@nestjs/common';
import { SmsService } from './sms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('sms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SmsController {
  constructor(private smsService: SmsService) {}

  @Get('logs')
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('beneficiaryId') beneficiaryId?: string,
    @Query('status') status?: string,
  ) {
    return this.smsService.getSmsLogs({
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
      beneficiaryId,
      status,
    });
  }

  @Get('templates')
  getTemplates() {
    return this.smsService.getTemplates();
  }

  @Post('templates')
  updateTemplate(@Body('name') name: string, @Body('body') body: string) {
    return this.smsService.updateTemplate(name, body);
  }

  @Post('send')
  sendManual(@Body() body: { phoneNumbers: string[]; message: string; beneficiaryIds?: string[]; sessionId?: string }) {
    return this.smsService.sendManualMessage(body);
  }

  @Post('send-bulk')
  sendBulk(
    @Body() body: {
      centerId?: string;
      sessionId?: string;
      status?: string;
      message: string;
      excludeCollected?: boolean;
    },
  ) {
    return this.smsService.sendBulkMessage(body);
  }
}
