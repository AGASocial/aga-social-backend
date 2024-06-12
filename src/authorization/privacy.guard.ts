import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import e, { Request } from "express";
import { Observable } from "rxjs";
import { UsersService } from "../users/users.service";

@Injectable()
export class PrivacyGuard implements CanActivate {

    constructor(private reflector: Reflector, private usersService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('PrivacyGuard - Checking privacy...'); 

        const exceptedRoles = this.reflector.getAllAndOverride<string[]>('excepted_roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        const req: Request = context.switchToHttp().getRequest();
        const requiredId = req.params.userId;
        const jwtToken: string = req.signedCookies.bearer_token;
        const userId = this.usersService.extractID(jwtToken);

        if (userId == requiredId) {
            return true
        }
        else {
            if (exceptedRoles != undefined) {
                const userSnap = await this.usersService.getUserById(userId);
                let userRoles = await this.usersService.getUserRole(userSnap);
                return exceptedRoles.some((role) => userRoles.includes(role));
            }
            else {
                return false;
            }
        }
    }
}
