import { Test, TestingModule } from '@nestjs/testing';
import { Response, Request } from 'express';
import { AuthController } from '../../../auth/auth.controller';
import { AuthService } from '../../../auth/auth.service';
import { RefreshDto } from '../../../auth/dto/refresh.dto';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('firebaseRefresh', () => {
        it('should return a valid response on successful session refresh', async () => {
            const jwtRefreshToken = 'aRefreshToken'; 

            const refreshDto: RefreshDto = {
                refresh_token: jwtRefreshToken,
            };

            const refreshResponse = {
                statusCode: 200,
                message: 'Session refreshed successfully',
                bearer_token: 'aNewBearerToken', 
            };

            jest.spyOn(authService, 'firebaseRefresh').mockResolvedValue(refreshResponse);

            const res: Partial<Response> = {
                cookie: jest.fn(),
                send: jest.fn(),
            };

            const req: Partial<Request> = {
                signedCookies: {
                    refresh_token: jwtRefreshToken,
                },
            };

            await authController.firebaseRefresh(res as Response, req as Request);

            expect(res.send).toHaveBeenCalledWith({
                statusCode: refreshResponse.statusCode,
                message: refreshResponse.message,
            });
        });

    });
});
