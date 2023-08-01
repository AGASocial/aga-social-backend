import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionModule } from 'src/session/session.module';
import { FirebaseService } from 'src/firebase/firebase.service';
import { HashService } from 'src/utils/hash.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwtRefresh.strategy';
import { SessionSerializer } from './session.serializer';
import { CsrfProtectionMiddleware } from 'src/session/middleware/csrfProtection.middleware';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { LocalAuthGuard } from './strategies/local-auth.guard'; 
import { CsrfValidationMiddleware } from '../session/middleware/csrfValidation.middleware';

@Module({
    controllers: [AuthController],
    imports: [
        UsersModule,
        SessionModule,
        RolesModule,
        HttpModule,
        PassportModule.register({ session: true }),
        ConfigModule.forRoot(),
        JwtModule.register({}),
    ],
    providers: [
        AuthService,
        HashService,
        SessionSerializer,
        JwtStrategy,
        JwtRefreshStrategy,
        FirebaseService,
        LocalAuthGuard, // Agregar LocalAuthGuard aquí
    ],
    exports: [AuthService],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(CsrfProtectionMiddleware).forRoutes('auth/firebase/login');

        consumer
            .apply(CsrfValidationMiddleware)
            .exclude(
                { path: 'auth/firebase/login', method: RequestMethod.POST },
              // { path: 'auth/firebase/signup', method: RequestMethod.POST },
                { path: 'auth/firebase/credentials', method: RequestMethod.POST },
                { path: 'auth/firebase/credentials/otp', method: RequestMethod.PUT }
            )
            .forRoutes({ path: '*', method: RequestMethod.ALL });

    }
}
