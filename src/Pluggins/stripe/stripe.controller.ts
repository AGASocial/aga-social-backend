import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  Response,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import { Cart } from './entities/cart.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CreateStripeEbookDto } from './dto/createStripeEbook.dto';

@ApiTags('Stripe')
@Controller('Payments')
export class StripeController {
  // This is your test secret API key.
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  public async SubscriptionIntent(
    @Request() req,
    @Body() createstripe: CreateStripeDto,
  ): Promise<any> {
    try {
      return this.stripeService.SubscriptionIntent(createstripe);
    } catch (error) {
      console.log(error);
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
        ebookId,
      );

      return { client_secret: clientSecret };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Post('create-checkout-session')
  @ApiOperation({ summary: 'Create a Stripe Checkout Session' })
  @ApiResponse({
    status: 200,
    description: 'Sesión de pago creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        clientSecret: { type: 'string' },
        url: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos proporcionados inválidos',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al crear la sesión de pago',
  })
  async createCheckoutSession(
    @Body('amount') amount: number,
    @Body('currency') currency: string,
    @Body('returnUrl') returnUrl?: string,
    @Body('productName') productName?: string,
  ): Promise<{ clientSecret: string; url: string }> {
    const session = await this.stripeService.createCheckoutSession(
      amount,
      currency,
      returnUrl,
      productName,
    );
    return {
      clientSecret: session.id,
      url: session.url,
    };
  }

  @Get('session-status')
  @ApiOperation({ summary: 'Retrieve checkout session status' })
  @ApiResponse({
    status: 200,
    description: 'Estado de la sesión recuperado exitosamente',
  })
  @ApiBadRequestResponse({ description: 'ID de sesión inválido' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async getSessionStatus(@Query('session_id') sessionId: string) {
    try {
      console.log(`Retrieving session status for session ID: ${sessionId}`);
      const session = await this.stripeService.retrieveCheckoutSession(
        sessionId,
      );
      console.log('Session retrieved:', {
        id: session.id,
        status: session.status,
        customer_email: session.customer_details?.email,
        metadata: session.metadata,
      });

      // Parse courseIds from string to array if it exists
      let courseIds = [];
      if (session.metadata?.courseIds) {
        try {
          courseIds = JSON.parse(session.metadata.courseIds);
          console.log('Parsed courseIds:', courseIds);
        } catch (error) {
          console.error('Error parsing courseIds:', error);
        }
      }

      return {
        status: session.status,
        customer_email: session.customer_details?.email,
        metadata: {
          ...session.metadata,
          courseIds: courseIds, // Return as actual array instead of string
        },
      };
    } catch (error) {
      console.error('Error retrieving session status:', error);
      throw error;
    }
  }

  @Post('create-checkout-session-redirect')
  @ApiOperation({ summary: 'Create a Stripe Checkout Session and redirect' })
  @ApiResponse({
    status: 302,
    description: 'Redirigiendo a la página de pago de Stripe',
  })
  async createCheckoutSessionRedirect(
    @Body('amount') amount: number,
    @Body('currency') currency: string,
    @Body('returnUrl') returnUrl: string,
    @Body('productName') productName: string,
    @Body('courseIds') courseIds: string,
    @Body('orderId') orderId: string,
    @Response() res,
  ) {
    const session = await this.stripeService.createCheckoutSession(
      amount,
      currency,
      returnUrl,
      productName,
      courseIds,
      orderId,
    );

    // Redirect directly to the Stripe checkout URL
    return res.redirect(302, session.url);
  }
}
