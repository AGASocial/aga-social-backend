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


@Module({
    imports: [MessageModule, CourseModule, EbookModule, UsersModule, AuthModule, MediaModule, ConfigModule.forRoot(), AuthorizationModule, AbilityModule, ThrottlerModule.forRoot({
        ttl: timeToLive,
        limit: throttlerLimit
    }), SessionModule, RolesModule],
    controllers: [AppController, AuthController, AuthorizationController, MediaController, EbookController, SectionController, CourseController, MessageController],
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
        consumer
            .apply(CsrfProtectionMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });

        consumer
            .apply(CsrfValidationMiddleware)
            .exclude(
                { path: 'auth/firebase/login', method: RequestMethod.POST },
                { path: 'auth/firebase/signup', method: RequestMethod.POST },
                { path: 'auth/firebase/credentials', method: RequestMethod.POST },
                { path: 'auth/firebase/credentials/otp', method: RequestMethod.PUT }
            )
            .forRoutes({ path: '*', method: RequestMethod.ALL });

        consumer
            .apply(UnauthenticatedMiddleware)
            .exclude({ path: 'auth/firebase/logout', method: RequestMethod.GET },
                     { path: 'auth/firebase/signup', method: RequestMethod.POST },
        )
            .forRoutes({ path: '*', method: RequestMethod.ALL });

    }
}