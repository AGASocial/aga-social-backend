import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import { StripeService } from '../Pluggins/stripe/stripe.service';
import { CourseService } from './course.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, CourseService, StripeService, JwtService],
    exports: [CourseService]
})
export class CourseModule { }
