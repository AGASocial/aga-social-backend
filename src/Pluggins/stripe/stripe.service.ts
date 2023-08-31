import { Injectable } from '@nestjs/common';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import { ConfigService } from '@nestjs/config';
import { Cart } from './entities/cart.entity';
import { JwtService } from '@nestjs/jwt';
import Stripe from 'stripe';
import { admin } from 'src/main';
import { createReadStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { CreatePlugginDto } from 'src/Pluggins/pluggin/dto/create-pluggin.dto';
import exp from 'constants';

@Injectable()
export class StripeService {
  private _stripe: Stripe;

  constructor(private configService: ConfigService, private jwtService: JwtService) {
    this._stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: null,
    });
  }
  async SubscriptionIntent(createStripe: CreateStripeDto) {
    try {
      let subscription;
      const customer = await this._stripe.customers.create({
        email: createStripe.receipt_email,
        source: createStripe.paymentMethodId

      })
      const mainDocs = [];

      createStripe.items.forEach(async element => {
        const product = await this._stripe.products.create({
          name: element._id
        })
        subscription = await this._stripe.subscriptions.create({
          customer: customer.id,
          items: [
            {
              price_data: {
                currency: createStripe.currency,
                product: product.id,
                unit_amount: element.price * 100,
                recurring: {
                  interval: element.interval
                },
              },
            },
          ],
          expand: ['latest_invoice.payment_intent']
        });
        var today = new Date();
        var expiration = new Date();
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
          allowed_domain: createStripe.allowed_domain
        };
        const fire = await admin.firestore().collection(this.configService.get<string>('COLLECTION_COMPANYPLUGIN')).doc().set(data);
        mainDocs.push({ subscription, firestore: fire });
      });
      return mainDocs


    } catch (error) {
      return error
    }
  };

} 
