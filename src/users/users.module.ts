import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { HttpModule } from '@nestjs/axios'
import { FirebaseAuthStrategy } from 'src/auth/stategies/firebase-jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'firebase-jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }), HttpModule, ConfigModule.forRoot({ isGlobal: true })
  ],
  providers: [UsersService, FirebaseAuthStrategy],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
