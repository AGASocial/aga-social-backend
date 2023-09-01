import { Module } from '@nestjs/common';
import { PlugginService } from './pluggin.service';
import { PlugginController } from './pluggin.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PlugginController],
  providers: [PlugginService]
})
export class PlugginModule {}
