import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";

//Guard that verifies if the user is authenticated
@Injectable()
export class AuthenticatedGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();
        
        return request.isAuthenticated();
    }
}