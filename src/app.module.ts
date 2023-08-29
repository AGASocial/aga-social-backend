import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { FirebaseService } from './firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from './authorization/authorization.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './authorization/roles.guard';
import { AuthorizationController } from './authorization/authorization.controller';
import { AbilityModule } from './ability/ability.module';
import { PoliciesGuard } from './authorization/policies.guard';
import { StageGuard } from './authorization/stage.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { throttlerLimit, timeToLive } from './utils/constants';
import { SessionModule } from './session/session.module';
import { RolesModule } from './roles/roles.module';
import { UnauthenticatedMiddleware } from './session/middleware/unauthenticated.middleware';
import { DataFiltererService } from './utils/dataFilterer.service';
import { HashService } from './utils/hash.service';
import { CsrfValidationMiddleware } from './session/middleware/csrfValidation.middleware';
import { CsrfProtectionMiddleware } from './session/middleware/csrfProtection.middleware';
import { MediaController } from './media/media.controller';
import { MediaModule } from './media/media.module';
import { MediaService } from './media/media.service';
import { EbookService } from './ebooks/ebooks.service';
import { EbookModule } from './ebooks/ebooks.module';
import { EbookController } from './ebooks/ebooks.controller';
import { SectionService } from './sections/sections.service';
import { SectionController } from './sections/sections.controller';
import { CourseService } from './courses/course.service';
import { CourseController } from './courses/course.controller';
import { CourseModule } from './courses/course.module';
import { MessageModule } from './messages/message.module';
import { MessageService } from './messages/message.service';
import { MessageController } from './messages/message.controller';
import { CouponModule } from './coupons/coupon.module';
import { CouponService } from './coupons/coupon.service';
import { CouponController } from './coupons/coupon.controller';
import { VimeoService } from './vimeo/vimeo.service';
import { TagsModule } from './tags/tags.module';
import { TagsService } from './tags/tags.service';
import { TagsController } from './tags/tags.controller';


@Module({
    imports: [TagsModule, CouponModule, MessageModule, CourseModule, EbookModule, UsersModule, AuthModule, MediaModule, ConfigModule.forRoot(), AuthorizationModule, AbilityModule, ThrottlerModule.forRoot({
        ttl: timeToLive,
        limit: throttlerLimit
    }), SessionModule, RolesModule],
    controllers: [TagsController, AppController, AuthController, AuthorizationController, MediaController, EbookController, SectionController, CourseController, MessageController, CouponController],
    providers: [
        AppService,
        DataFiltererService,
        StageGuard,
        PoliciesGuard,
        FirebaseService,
        HashService,
        MediaService,
        EbookService,
        SectionService,
        CourseService,
        MessageService,
        CouponService,
        VimeoService,
        TagsService,
        
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
       
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
       /* consumer
            .apply(CsrfProtectionMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });*/
        /*
        consumer
            .apply(CsrfValidationMiddleware)
            .exclude(
                { path: 'auth/users/sessions', method: RequestMethod.POST },
                { path: 'auth/users', method: RequestMethod.POST },
                { path: 'auth/users', method: RequestMethod.PATCH },
            )
            .forRoutes({ path: '*', method: RequestMethod.ALL });*/

        consumer
            .apply(UnauthenticatedMiddleware)
            .exclude({ path: 'auth/users/sessions', method: RequestMethod.GET },
                     { path: 'auth/users', method: RequestMethod.POST },
        )
            .forRoutes({ path: '*', method: RequestMethod.ALL });

    }
}