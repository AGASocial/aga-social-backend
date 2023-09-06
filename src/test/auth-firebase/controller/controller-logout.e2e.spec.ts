import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from '../../../auth/auth.controller';
import { AuthService } from '../../../auth/auth.service';
import { LogOutResponseDto } from '../../../auth/dto/logoutResponse.dto';

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

    describe('logout', () => {
        it('should return a valid response on successful logout', async () => {
            const logoutResponseDto: LogOutResponseDto = {
                statusCode: 200,
                message: 'User logged out successfully',
            };

            jest.spyOn(authService, 'firebaseLogout').mockResolvedValue(logoutResponseDto);

            const res: Partial<Response> = {
                clearCookie: jest.fn(),
                send: jest.fn(),
            };

            await authController.logout(res as Response);

            expect(res.clearCookie).toHaveBeenCalledWith('connect.sid');
            expect(res.clearCookie).toHaveBeenCalledWith('bearer_token', { signed: true });
            expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', { signed: true });
            expect(res.clearCookie).toHaveBeenCalledWith('csrfCookieName');

            expect(res.send).toHaveBeenCalledWith(logoutResponseDto);
        });

    });
});
