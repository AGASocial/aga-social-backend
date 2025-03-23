import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Payment } from './entities/payment.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ProcessPaymentResponseDto } from './dto/process-payment-response.dto';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });
  }

  async createCheckoutSession(
    amount: number,
    currency: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Total Payment',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async processPayment(
    paymentData: ProcessPaymentDto,
  ): Promise<ProcessPaymentResponseDto> {
    try {
      // Here you would typically integrate with a payment processor
      // like Stripe, Square, or PayPal

      // Create a new payment record
      const payment = new Payment();
      payment.id = uuidv4();
      payment.amount = paymentData.amount;
      payment.orderId = paymentData.orderId;
      payment.status = 'succeeded'; // In real implementation, this would come from payment processor
      payment.creditCard = {
        ...paymentData.creditCard,
        // In production, you would encrypt sensitive data
        cardNumber: this.maskCardNumber(paymentData.creditCard.cardNumber),
      };
      payment.billingAddress = paymentData.billingAddress;
      payment.createdAt = new Date();
      payment.updatedAt = new Date();

      // In a real implementation, you would save this to your database
      // For now, we'll just return the payment response
      return {
        id: payment.id,
        status: payment.status,
        orderId: payment.orderId,
        amount: payment.amount,
        createdAt: payment.createdAt,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to process payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private maskCardNumber(cardNumber: string): string {
    const lastFourDigits = cardNumber.slice(-4);
    return `****-****-****-${lastFourDigits}`;
  }
}
