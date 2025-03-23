import { Injectable } from '@nestjs/common';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import { ConfigService } from '@nestjs/config';
import { Cart } from './entities/cart.entity';
import { JwtService } from '@nestjs/jwt';
import Stripe, { Stripe as StripeTypes } from 'stripe';
import { createReadStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import exp from 'constants';
import { admin } from '../../main';
import { CreateStripeCourseDto } from './dto/createStripeCourse.dto';
import { CreateStripeEbookDto } from './dto/createStripeEbook.dto';

@Injectable()
export class StripeService {
  private _stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this._stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: null,
      },
    );
  }
  async SubscriptionIntent(createStripe: CreateStripeDto) {
    try {
      let subscription;
      const customer = await this._stripe.customers.create({
        email: createStripe.receipt_email,
        source: createStripe.paymentMethodId,
      });
      const mainDocs = [];

      createStripe.items.forEach(async (element) => {
        const product = await this._stripe.products.create({
          name: element._id,
        });
        subscription = await this._stripe.subscriptions.create({
          customer: customer.id,
          items: [
            {
              price_data: {
                currency: createStripe.currency,
                product: product.id,
                unit_amount: element.price * 100,
                recurring: {
                  interval: element.interval,
                },
              },
            },
          ],
          expand: ['latest_invoice.payment_intent'],
        });
        const today = new Date();
        const expiration = new Date();
        if (element.interval == 'year') {
          expiration.setFullYear(expiration.getFullYear() + 1);
        } else {
          expiration.setMonth(expiration.getMonth() + 1);
        }
        const data = {
          token_id: uuidv4(),
          purchase_date: today.toJSON(),
          expiration_date: expiration.toJSON(),
          payment_provider: 'stripe',
          payment_id: subscription.id,
          client_uid: createStripe.uid,
          plugin_uid: element._id,
          allowed_domain: createStripe.allowed_domain,
        };
        const fire = await admin
          .firestore()
          .collection(
            this.configService.get<string>('COLLECTION_COMPANYPLUGIN'),
          )
          .doc()
          .set(data);
        mainDocs.push({ subscription, firestore: fire });
      });
      return mainDocs;
    } catch (error) {
      return error;
    }
  }

  async createPaymentIntentForEbook(
    receipt_email: string,
    paymentMethodId: string,
    ebookId: string,
  ): Promise<string> {
    try {
      console.log('Received receipt_email:', receipt_email);
      console.log('Received paymentMethodId:', paymentMethodId);
      console.log('Received ebookId:', ebookId);

      const customer = await this._stripe.customers.create({
        email: receipt_email,
        source: paymentMethodId,
      });

      const ebookQuerySnapshot = await admin
        .firestore()
        .collection('ebooks')
        .where('id', '==', ebookId)
        .get();

      if (ebookQuerySnapshot.empty) {
        throw new Error('Ebook not found');
      }

      const ebookDoc = ebookQuerySnapshot.docs[0];
      const ebookData = ebookDoc.data();
      const ebookPriceInCents = ebookData.price * 100;

      // Create a Payment Intent for the ebook.
      const paymentIntent = await this._stripe.paymentIntents.create({
        amount: ebookPriceInCents,
        currency: 'usd',
        description: 'Ebook Purchase',
        metadata: {
          ebookId: ebookId,
        },
      });

      console.log('Created paymentIntent:', paymentIntent);

      // Return the client secret to confirm the payment.
      return paymentIntent.client_secret;
    } catch (error) {
      console.error('Error creating Payment Intent:', error);
      throw error;
    }
  }

  async createPaymentIntentForCourse(
    createStripe: CreateStripeCourseDto,
    courseId: string,
  ): Promise<string> {
    try {
      const customer = await this._stripe.customers.create({
        email: createStripe.receipt_email,
        source: createStripe.paymentMethodId,
      });

      const courseQuerySnapshot = await admin
        .firestore()
        .collection('courses')
        .where('id', '==', courseId)
        .get();

      if (courseQuerySnapshot.empty) {
        throw new Error('Course not found');
      }

      const courseDoc = courseQuerySnapshot.docs[0];
      const courseData = courseDoc.data();
      const coursePriceInCents = courseData.price * 100;

      const paymentIntent = await this._stripe.paymentIntents.create({
        amount: coursePriceInCents,
        currency: createStripe.currency,
        description: 'Course Purchase',
        metadata: {
          userId: createStripe.uid,
          courseId: courseId,
        },
      });

      // Return the client secret to confirm the payment.
      return paymentIntent.client_secret;
    } catch (error) {
      console.error('Error creating Payment Intent:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const paymentIntent = await this._stripe.paymentIntents.confirm(
        paymentIntentId,
      );

      if (paymentIntent.status === 'succeeded') {
        return true; //Payment was successful
      } else {
        return false; //Payment could not be completed
      }
    } catch (error) {
      console.error('Error confirming Payment Intent:', error);
      throw error;
    }
  }

  async createCheckoutSession(
    amount: number,
    currency: string,
    returnUrl?: string,
    productName?: string,
    courseIds?: string,
    orderId?: string,
  ): Promise<Stripe.Checkout.Session> {
    // Default return URL if none provided
    const baseReturnUrl = returnUrl || 'localhost:3000';

    // Ensure returnUrl starts with http:// or https://
    const formattedReturnUrl =
      baseReturnUrl.startsWith('http://') ||
      baseReturnUrl.startsWith('https://')
        ? baseReturnUrl
        : `https://${baseReturnUrl}`;

    console.log('Creating checkout session with metadata:', {
      courseIds: courseIds ?? '[]',
      orderId: orderId ?? '',
    });

    const sessionParams: StripeTypes.Checkout.SessionCreateParams = {
      ui_mode: 'hosted',
      payment_method_types: ['card'],
      metadata: {
        courseIds: courseIds ?? '[]',
        orderId: orderId ?? '',
      },
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName || 'Total Payment',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment' as StripeTypes.Checkout.SessionCreateParams.Mode,
      success_url: `${formattedReturnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${formattedReturnUrl}?canceled=true`,
      phone_number_collection: {
        enabled: true,
      },
    };

    console.log('Session params:', JSON.stringify(sessionParams, null, 2));
    
    const session = await this._stripe.checkout.sessions.create(sessionParams);
    
    console.log('Created session:', {
      id: session.id,
      url: session.url,
      metadata: session.metadata,
    });
    
    return session;
  }

  async retrieveCheckoutSession(sessionId: string) {
    try {
      return await this._stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      throw error;
    }
  }
}
