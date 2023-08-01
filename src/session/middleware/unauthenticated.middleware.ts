import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { getAuth, signOut } from "firebase/auth";

//Unauthenticates an user and cleans the cookies
export class UnauthenticatedMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: NextFunction) {
        console.log('UnauthenticatedMiddleware executing...'); // Agregado console.log()

        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            try {
                console.log('Signing out user...'); // Agregado console.log()
                signOut(auth);
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
            }
        }

        if ('connect.sid' in req.signedCookies) {
            console.log('Clearing connect.sid cookie...'); // Agregado console.log()
            res.clearCookie('connect.sid');
        }
        if ('bearer_token' in req.signedCookies) {
            console.log('Clearing bearer_token cookie...'); // Agregado console.log()
            res.clearCookie('bearer_token');
        }
        if ('refresh_token' in req.signedCookies) {
            console.log('Clearing refresh_token cookie...'); // Agregado console.log()
            res.clearCookie('refresh_token');
        }

        next();
    }
}
