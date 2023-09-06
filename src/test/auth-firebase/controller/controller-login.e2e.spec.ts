import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from '../../../auth/auth.controller';
import { AuthService } from '../../../auth/auth.service';
import { LogInDto } from '../../../auth/dto/login.dto';
import { LogInResponseDto } from '../../../auth/dto/loginResponse.dto';

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

    describe('firebaseLogin', () => {
        it('should return a valid response on successful login', async () => {
            const logInDto: LogInDto = {
                email: 'frio2@gmail.com',
                password: 'Vitra/?13',
            };

            const logInResponseDto: LogInResponseDto = {
                statusCode: 201,
                message: 'LOGINSUCCESSFUL',
                userId: 'someUserId',
                bearer_token: 'yourBearerToken',
                authCookieAge: 3600, 
                refresh_token: 'yourRefreshToken',
                refreshCookieAge: 86400, 
            };

            jest.spyOn(authService, 'firebaseLogin').mockResolvedValue(logInResponseDto);

            const res: Partial<Response> = {
                cookie: jest.fn(),
                send: jest.fn(),
            };

            await authController.firebaseLogin(logInDto, res as Response, {});

            expect(res.send).toHaveBeenCalledWith({
                statusCode: logInResponseDto.statusCode,
                message: logInResponseDto.message,
                userId: logInResponseDto.userId,
            });
        });

    });
});
