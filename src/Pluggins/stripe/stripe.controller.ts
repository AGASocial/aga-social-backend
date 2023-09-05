import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import { Cart } from './entities/cart.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreateStripeEbookDto } from './dto/createStripeEbook.dto';

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

    @Post('assets/ebooks')
    public async createPaymentIntentForEbook(
        @Request() req,
        @Body() createStripe,
    ): Promise<any> {
        try {
            const { receipt_email, paymentMethodId, ebookId } = createStripe;
            

            const clientSecret = await this.stripeService.createPaymentIntentForEbook(
                receipt_email,
                paymentMethodId,                
                ebookId
            );

            return { client_secret: clientSecret };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}



