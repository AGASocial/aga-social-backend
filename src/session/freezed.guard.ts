import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { getAuth } from 'firebase/auth';

@Injectable()
export class FreezedGuard implements CanActivate {
    constructor() { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest();

        console.log('FreezedGuard executing...');

        let isNotFreezed: boolean = false;
        const auth = getAuth();
        const user = auth.currentUser;

        // No Session in course. Allow login
        if (!('bearer_token' in req.signedCookies) && user === null) {
            console.log('No session in course. Allowing login...');
            isNotFreezed = true;
        }
        // Session in course. Close the old session
        else if ('bearer_token' in req.signedCookies && user !== null) {
            console.log('Session in course. Closing the existing session...');

            await auth.signOut();

            console.log('Opening a new session...');
            isNotFreezed = true;
        }
        // Session in course but because of an error or attack there is no sign in on Firebase Auth
        else if ('bearer_token' in req.signedCookies && user === null) {
            console.log('Session in course. Closing the existing session...');

            await auth.signOut();

            console.log('Opening a new session...');
            isNotFreezed = true;
        }

        // No session in course, but Firebase Auth is open, allow login
        else if (!('bearer_token' in req.signedCookies) && user !== null) {
            console.log('No session in course, but Firebase Auth is open. Allowing login...');
            isNotFreezed = true;
            await auth.signOut();
        }

        return isNotFreezed;
    }
}
