import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { csrfCookieName, /*generateToken */ } from "src/utils/constants";
import { generateToken } from 'src/utils/csrfUtils'

//Generates a CSFR Token and adds it to a cookie
export class CsrfProtectionMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: NextFunction) {
        const csrfToken = generateToken(res,req);
        res.cookie(csrfCookieName,csrfToken, {httpOnly: false});

        next();
    }
}