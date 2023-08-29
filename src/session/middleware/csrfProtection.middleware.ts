import { NestMiddleware, Logger } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { csrfCookieName } from "../../utils/constants";
import { generateToken } from "../../utils/csrfUtils";

export class CsrfProtectionMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('CsrfProtectionMiddleware executing...');

        if (req.path !== '/get-csrf-token') {
            const csrfToken = generateToken(res, req);
            console.log(`Generated CSRF token: ${csrfToken}`);
            res.cookie(csrfCookieName, csrfToken, { httpOnly: false });
            console.log(`CSRF token added to cookie: ${csrfCookieName}`);
        }

        next();
    }
}