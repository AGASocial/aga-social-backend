import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from '../../../auth/auth.controller';
import { AuthService } from '../../../auth/auth.service';
import { SignUpDto } from '../../../auth/dto/signup.dto';
import { SignUpDtoResponse } from '../../../auth/dto/signupResponse.dto';

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

    describe('firebaseSignup', () => {
        it('should return a valid response on successful signup', async () => {
            const signUpDto: SignUpDto = {
                email: 'test123456@gmail.com',
                username: 'Test.7778',
                password: 'Vitra/?13',
            };

            const signUpDtoResponse: SignUpDtoResponse = {
                statusCode: 201,
                message: 'SIGNUPSUCCESSFUL',
                userId: 'anUserId',
            };

            jest.spyOn(authService, 'firebaseSignUp').mockResolvedValue(signUpDtoResponse);

            const res: Partial<Response> = {
                send: jest.fn(),
            };

            await authController.firebaseSignup(signUpDto, res as Response);

            expect(res.send).toHaveBeenCalledWith({
                statusCode: signUpDtoResponse.statusCode,
                message: signUpDtoResponse.message,
                userId: signUpDtoResponse.userId,
            });
        });

    });
});
