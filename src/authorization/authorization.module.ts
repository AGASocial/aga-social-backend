import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';
import { RolesGuard } from './roles.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { StageGuard } from './stage.guard';
import { FirebaseService } from '../firebase/firebase.service';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { SessionModule } from '../session/session.module';
import { jwtSecret, jwtTime } from '../utils/constants';
import { DataFiltererService } from '../utils/dataFilterer.service';
import { HashService } from '../utils/hash.service';
import { SessionSerializer } from '../auth/session.serializer';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { CsrfProtectionMiddleware } from '../session/middleware/csrfProtection.middleware';
import { CsrfValidationMiddleware } from '../session/middleware/csrfValidation.middleware';

@Module({
    controllers: [AuthorizationController],
    imports: [UsersModule, RolesModule, SessionModule, PassportModule.register({ session: true }), ConfigModule.forRoot(), JwtModule.register({
        secret: jwtSecret,
        signOptions: { expiresIn: jwtTime }
    }), HttpModule, UsersModule],
    providers: [AuthorizationService, DataFiltererService, RolesGuard, HashService, SessionSerializer, JwtStrategy, FirebaseService, AuthService, JwtService, StageGuard],
    exports: [AuthorizationService]
})
export class AuthorizationModule { }


    /*implements NestModule {

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(CsrfProtectionMiddleware).forRoutes('*');

        consumer.apply(CsrfValidationMiddleware).forRoutes('*');
    }

}*/
