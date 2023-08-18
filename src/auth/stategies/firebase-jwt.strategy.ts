import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import * as admin from 'firebase-admin';
import { jwtConstants } from '../constants';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy) {

    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }

    validate(token) {
        return admin.auth()
            .verifyIdToken(token, true)
            .catch((err) => {
                console.log(err);
                throw new UnauthorizedException();
            });
    }
}