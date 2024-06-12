/*import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
    constructor(private configService: ConfigService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const userRoleIds: string[] = req.user.role.map(role => role.id);
        const allowedRoleIds: string[] = [
            this.configService.get<string>('SUBSCRIBER_ID'),
            this.configService.get<string>('ADMIN_ID'),
            this.configService.get<string>('PUBLISHER_ID'),
        ];
        const hasPermission = userRoleIds.some(roleId => allowedRoleIds.includes(roleId));
        if (!hasPermission) {
            return res.status(403).json({
                status: 'error',
                code: 403,
                message: 'Forbidden: User does not have permission to access this resource',
                data: { result: {} }
            });
        }
        next();
    }
}
*/