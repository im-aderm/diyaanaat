import { Module } from '@nestjs/common';
import { CowsService } from './cows.service';
import { CowsController } from './cows.controller';

@Module({
  providers: [CowsService],
  controllers: [CowsController],
  exports: [CowsService],
})
export class CowsModule {}
