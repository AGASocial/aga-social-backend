import {  NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { csrfCookieName, csrfParamName} from "src/utils/constants";

//Validates the CSRF Token from the cookies, checks if csrfParamName == csrfCookieName
export class CsrfValidationMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: NextFunction) {

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
            }
        }
        else {
            throw new UnauthorizedException;
        }

        next();
    }
}