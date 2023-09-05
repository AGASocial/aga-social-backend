import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import { StripeService } from '../Pluggins/stripe/stripe.service';
import { EbookService } from './ebooks.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, EbookService, StripeService, JwtService],
    exports: [EbookService]
})
export class EbookModule { }
