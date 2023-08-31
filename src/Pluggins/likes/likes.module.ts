import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
/*  imports: [ConfigModule],
  controllers: [LikesController],
  providers: [LikesService]*/
})
export class LikesModule {}
