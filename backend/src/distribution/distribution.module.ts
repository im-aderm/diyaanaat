import { Module } from '@nestjs/common';
import { DistributionService } from './distribution.service';
import { DistributionController } from './distribution.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [DistributionService],
  controllers: [DistributionController],
  exports: [DistributionService],
})
export class DistributionModule {}
