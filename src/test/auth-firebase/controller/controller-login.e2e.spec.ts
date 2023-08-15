import { Test, TestingModule } from '@nestjs/testing';
import { Response, Request } from 'express';
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
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        firebaseLogin: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('firebaseLogin', () => {
        it('should return status code, message, and set cookies', async () => {
           
            const mockLogInDto: LogInDto = {
                email: 'joel114@gmail.com',
                password: 'Vitra/?13',
            };
            const mockResponse: LogInResponseDto = {
                statusCode: 200,
                message: 'LOGINSUCCESSFUL',
                bearer_token: 'mock_bearer_token',
                authCookieAge: 3600,
                refresh_token: 'mock_refresh_token',
                refreshCookieAge: 86400,
            };
            const mockRequest = {} as Request;
            const mockResponseObj = {
                cookie: jest.fn(),
                send: jest.fn(),
            } as unknown as Response;

            authService.firebaseLogin = jest.fn().mockResolvedValue(mockResponse);

       
            await authController.firebaseLogin(mockLogInDto, mockResponseObj, mockRequest);

            expect(mockResponseObj.cookie).toHaveBeenCalledWith('bearer_token', 'mock_bearer_token', {
                signed: true,
                maxAge: 3600,
            });
            expect(mockResponseObj.cookie).toHaveBeenCalledWith('refresh_token', 'mock_refresh_token', {
                signed: true,
                maxAge: 86400,
            });
            expect(mockResponseObj.send).toHaveBeenCalledWith({
                statusCode: 200,
                message: 'LOGINSUCCESSFUL',
            });
        });
    });
});
