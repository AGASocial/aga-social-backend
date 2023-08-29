import { NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { csrfCookieName, csrfParamName } from "../../utils/constants";

// Validates the CSRF Token from the cookies, checks if csrfParamName == csrfCookieName
export class CsrfValidationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('CsrfValidationMiddleware executing...');

        const csrfTokenFromCookie = req.cookies[csrfCookieName];
        const csrfTokenFromQueryParam = req.query[csrfParamName];

        if (csrfTokenFromCookie !== undefined) {
            console.log('CSRF cookie found...');
            if (csrfTokenFromQueryParam !== csrfTokenFromCookie) {
                console.log('CSRF token mismatch...');
                throw new UnauthorizedException();
            } else {
                console.log('CSRF token matched...');
            }
        } else {
            console.log('CSRF cookie not found...');
            throw new UnauthorizedException();
        }

        next();
    }
}