import { Module } from '@nestjs/common';
import { PlugginService } from './pluggin.service';
import { PlugginController } from './pluggin.controller';

@Module({
  controllers: [PlugginController],
  providers: [PlugginService]
})
export class PlugginModule {}
