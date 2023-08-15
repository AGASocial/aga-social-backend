import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from '../../../auth/auth.controller';
import { AuthService } from '../../../auth/auth.service';
import { LogOutResponseDto } from '../../../auth/dto/logoutResponse.dto';
import { csrfCookieName } from '../../../utils/constants';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        firebaseLogout: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('logout', () => {
        it('should return logout response and clear cookies', async () => {
            // Arrange
            const mockResponse: LogOutResponseDto = {
                statusCode: 200,
                message: 'LOGGEDOUT',
            };

            const mockRes = {
                clearCookie: jest.fn(),
                send: jest.fn(),
            } as unknown as Response;

            authService.firebaseLogout = jest.fn().mockResolvedValue(mockResponse);

            // Act
            await authController.logout(mockRes);

            // Assert
            expect(mockRes.clearCookie).toHaveBeenCalledTimes(4);
            expect(mockRes.clearCookie).toHaveBeenCalledWith('connect.sid');
            expect(mockRes.clearCookie).toHaveBeenCalledWith('bearer_token');
            expect(mockRes.clearCookie).toHaveBeenCalledWith('refresh_token');
            expect(mockRes.clearCookie).toHaveBeenCalledWith(csrfCookieName);
            expect(mockRes.send).toHaveBeenCalledWith(mockResponse);
        });
    });
});
