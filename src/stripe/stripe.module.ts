import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [StripeController],
  providers: [StripeService, JwtService]
})
export class StripeModule { }
