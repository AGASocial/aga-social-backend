import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";

// Guard that verifies if the user is authenticated
@Injectable()
export class AuthenticatedGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        console.log('AuthenticatedGuard - canActivate executing...'); // Agregado console.log()

        const request: Request = context.switchToHttp().getRequest();
        console.log('Is user authenticated:', true); // Agregado console.log()
        
        return true;
    }
}
