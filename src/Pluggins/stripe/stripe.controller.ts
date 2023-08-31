import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import { Cart } from './entities/cart.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreatePlugginDto } from 'src/Pluggins/pluggin/dto/create-pluggin.dto';

@ApiTags('Stripe')
@Controller('Payments')
export class StripeController {
  // This is your test secret API key.
  constructor(private readonly stripeService: StripeService) { }

  @Post()
  public async SubscriptionIntent(@Request() req, @Body() createstripe: CreateStripeDto): Promise<any> {
    try {
      return this.stripeService.SubscriptionIntent(createstripe);

    } catch (error) {
      console.log(error)
    }
  }

}
