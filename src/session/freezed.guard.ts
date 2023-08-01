import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { getAuth } from "firebase/auth";

//Protects Logins by avoiding simultaneous sessions
@Injectable()
export class FreezedGuard implements CanActivate {

    constructor(){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const req: Request = context.switchToHttp().getRequest();

        let isNotFreezed: boolean = false;
        const auth = getAuth();
        const user = auth.currentUser;
        
        //No Session in course. Allow login
        if (!('bearer_token' in req.signedCookies) && (user == null)) {
            isNotFreezed = true;
        }
        //Session in course. Do not allow login
        else if (('bearer_token' in req.signedCookies) && (user != null)) {
            throw new BadRequestException("SESSIONINCOURSE")
        }
        //Session in couse but because of an error or attack there is no sign in on Firebase Auth
        else if (('bearer_token' in req.signedCookies) && (user == null)){
            throw new BadRequestException("SESSIONINCOURSE");
        }
        //No session in course, but Firebase Auth is open, allow login
        else if (!('bearer_token' in req.signedCookies) && (user != null)){
            
            isNotFreezed = true;
        }
        
        return isNotFreezed;
    }
}