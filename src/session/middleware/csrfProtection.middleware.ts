import { NestMiddleware, Logger } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { csrfCookieName } from "src/utils/constants";
import { generateToken } from 'src/utils/csrfUtils';

export class CsrfProtectionMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: NextFunction) {
        console.log('CsrfProtectionMiddleware executing...'); // Agregado console.log()
        const csrfToken = generateToken(res, req);

        console.log(`Generated CSRF token: ${csrfToken}`); // Agregado console.log()
        res.cookie(csrfCookieName, csrfToken, { httpOnly: false });

        console.log(`CSRF token added to cookie: ${csrfCookieName}`); // Agregado console.log()
        next();
    }
}
