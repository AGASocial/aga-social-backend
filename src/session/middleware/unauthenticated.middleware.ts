import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { getAuth, signOut } from "firebase/auth";


//Unauthenticates an user and cleans the cookies
export class UnauthenticatedMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: NextFunction) {

        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            try {
                signOut(auth);
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
            }
        }

 
        if ('connect.sid' in req.signedCookies) {
            res.clearCookie('connect.sid');
        }
        if ('bearer_token' in req.signedCookies) {
            res.clearCookie('bearer_token');
        }
        if ('refresh_token' in req.signedCookies) {
            res.clearCookie('refresh_token');
        }

        
        next();
    }
}
