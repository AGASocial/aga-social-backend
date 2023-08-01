import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { csrfCookieName, csrfParamName } from 'src/utils/constants';

@Injectable()
export class CsrfGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest();

        console.log('CsrfGuard executing...'); // Agregado console.log()

        if (req.cookies[csrfCookieName] !== undefined) {
            console.log('CSRF cookie found...'); // Agregado console.log()

            Object.defineProperties(req.params, {
                [csrfParamName]: {
                    value: req.cookies[csrfCookieName],
                    writable: false,
                    configurable: true,
                },
            });

            if (req.params[csrfParamName] !== req.cookies[csrfCookieName]) {
                console.log('CSRF token mismatch...'); // Agregado console.log()
                throw new UnauthorizedException();
            } else {
                console.log('CSRF token matched and removed from params...'); // Agregado console.log()
                delete req.params[csrfParamName];
                return true;
            }
        } else {
            console.log('CSRF cookie not found...'); // Agregado console.log()
            throw new UnauthorizedException();
        }
    }
}
