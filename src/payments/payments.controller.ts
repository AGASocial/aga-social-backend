import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ProcessPaymentResponseDto } from './dto/process-payment-response.dto';

@Controller('payments')
@ApiTags('Payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('gateways')
  @ApiOperation({ summary: 'Get available payment gateways' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of available payment gateways', 
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          active: { type: 'boolean' }
        }
      }
    }
  })
  getPaymentGateways(): { name: string, active: boolean }[] {
    return [
      { name: 'PayPal', active: true },
      { name: 'Apple Pay', active: false },
      { name: 'Google Pay', active: true },
      { name: 'Zelle', active: false },
      { name: 'Stripe', active: true },
      { name: 'Square', active: false }
    ];
  }

  @Post('process')
  @ApiOperation({ summary: 'Process a payment' })
  @ApiResponse({ 
    status: 201, 
    description: 'Payment processed successfully', 
    type: ProcessPaymentResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid payment information provided' 
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error while processing payment' 
  })
  async processPayment(
    @Body() paymentData: ProcessPaymentDto,
  ): Promise<ProcessPaymentResponseDto> {
    return this.paymentsService.processPayment(paymentData);
  }
}
