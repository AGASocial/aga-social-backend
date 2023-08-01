import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { csrfCookieName, csrfParamName} from "src/utils/constants";

//Guard that protects routes from CSRF attacks by verifying CSRF Tokens
@Injectable()
export class CsrfGuard implements CanActivate {
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const req: Request = context.switchToHttp().getRequest();

        if (req.cookies[csrfCookieName] != undefined) {
            
            Object.defineProperties(req.params ,{
                [csrfParamName]: {
                    value: req.cookies[csrfCookieName],
                    writable: false,
                    configurable: true
                }
            })
            if ((req.params[csrfParamName] != req.cookies[csrfCookieName])) {
                throw new UnauthorizedException;
            }
            else if (req.params[csrfParamName] == req.cookies[csrfCookieName]) {
                delete req.params[csrfParamName];

                return true;
            }
        }
        else {
            throw new UnauthorizedException;
        }
    }

}