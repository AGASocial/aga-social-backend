import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { CouponService } from './coupon.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, CouponService],
    exports: [CouponService]
})
export class CouponModule { }
