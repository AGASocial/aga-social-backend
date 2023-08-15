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
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        firebaseRefresh: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('firebaseRefresh', () => {
        it('should refresh session and return updated bearer token and status code', async () => {
            // Arrange
            const mockRefreshToken = 'mock_refresh_token';
            const mockResponse = {
                statusCode: 200,
                message: 'REFRESHSUCCESSFUL',
                bearer_token: 'new_mock_bearer_token',
            };
            const refreshDto: RefreshDto = { refresh_token: mockRefreshToken };

            authService.firebaseRefresh = jest.fn().mockResolvedValue(mockResponse);

            const mockRes = {
                cookie: jest.fn(),
                send: jest.fn(),
            } as unknown as Response;

            const mockReq = {
                signedCookies: {
                    refresh_token: mockRefreshToken,
                },
            } as unknown as Request;

            // Act
            await authController.firebaseRefresh(mockRes, mockReq);

            // Assert
            expect(authService.firebaseRefresh).toHaveBeenCalledWith(refreshDto);
            expect(mockRes.cookie).toHaveBeenCalledWith('bearer_token', mockResponse.bearer_token, {
                signed: true,
            });
            expect(mockRes.send).toHaveBeenCalledWith({
                statusCode: mockResponse.statusCode,
                message: mockResponse.message,
            });
        });
    });
});
