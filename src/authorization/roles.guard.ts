import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { doc, getDoc } from "firebase/firestore";
import { Observable } from "rxjs";
import { AuthService } from "src/auth/auth.service";
import { FirebaseService } from "src/firebase/firebase.service";
import { User } from "src/users/users.entity";
import { AuthorizationService } from "./authorization.service";
import { UsersService } from "src/users/users.service";

//Checks if the user has authorization to access resources by verifying their roles
@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private reflector: Reflector, private usersService: UsersService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        //extraction of required roles
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles',[
            context.getHandler(),
            context.getClass(),
        ]);

        const req: Request = context.switchToHttp().getRequest();
        
        if (!requiredRoles) {
            return true;
        }
        
        else {
            const jwtToken: string = req.signedCookies.bearer_token;
            const userExpiration = this.usersService.extractExpiration(jwtToken)
            const timeLeft = (Number(userExpiration) - Date.now()/1000);
            if (timeLeft <= 90){
                console.warn("[TIME_LEFT]: ", timeLeft);
            }
            const userId = this.usersService.extractID(jwtToken);
            const userSnap = await this.usersService.getUserById(userId);
            let userRoles = await this.usersService.getUserRole(userSnap);
            return requiredRoles.some((role) => userRoles.includes(role));
        }
    }   
}