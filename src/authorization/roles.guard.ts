import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { doc, getDoc } from "firebase/firestore";
import { Observable } from "rxjs";
import { UsersService } from "../users/users.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private usersService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('RolesGuard - Checking user roles...'); 

        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        const req: Request = context.switchToHttp().getRequest();

        if (!requiredRoles) {
            return true;
        } else {
            const jwtToken: string = req.signedCookies.bearer_token;
            const userExpiration = this.usersService.extractExpiration(jwtToken)
            const timeLeft = (Number(userExpiration) - Date.now() / 1000);
            if (timeLeft <= 90) {
                console.warn("[TIME_LEFT]: ", timeLeft);
            }
            const userId = this.usersService.extractID(jwtToken);
            const userSnap = await this.usersService.getUserById(userId);
            let userRoles = await this.usersService.getUserRole(userSnap);
            console.log('Required roles:', requiredRoles); 
            console.log('User roles:', userRoles); 
            const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));
            console.log('Has required role:', hasRequiredRole); 
            return hasRequiredRole;
        }
    }
}
