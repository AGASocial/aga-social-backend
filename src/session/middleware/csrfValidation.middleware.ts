import { NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { csrfCookieName, csrfParamName } from "../../utils/constants";

//Validates the CSRF Token from the cookies, checks if csrfParamName == csrfCookieName
export class CsrfValidationMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: NextFunction) {
        console.log('CsrfValidationMiddleware executing...'); // Agregado console.log()

        if (req.cookies[csrfCookieName] != undefined) {
            console.log('CSRF cookie found...');
            Object.defineProperties(req.params, {
                [csrfParamName]: {
                    value: req.cookies[csrfCookieName],
                    writable: false,
                    configurable: true
                }
            });
            if (req.params[csrfParamName] != req.cookies[csrfCookieName]) {
                console.log('CSRF token mismatch...'); // Agregado console.log()
                throw new UnauthorizedException();
            } else {
                console.log('CSRF token matched...'); // Agregado console.log()
                delete req.params[csrfParamName];
            }
        } else {
            console.log('CSRF cookie not found...'); // Agregado console.log()
            throw new UnauthorizedException();
        }

        next();
    }
}
