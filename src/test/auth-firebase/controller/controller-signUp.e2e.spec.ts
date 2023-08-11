import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { AuthController } from '../../../auth/auth.controller';
import { SignUpDtoResponse } from '../../../auth/dto/signupResponse.dto';
import { SignUpDto } from '../../../auth/dto/signup.dto';

describe('AuthController', () => {
    let app: INestApplication;
    let authService: AuthService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        firebaseSignUp: jest.fn(),
                    },
                },
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();

        authService = module.get<AuthService>(AuthService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('firebaseSignup', () => {
        it('should return status code and message from authService', async () => {
            const mockResponse: SignUpDtoResponse = {
                statusCode: 201,
                message: 'SIGNUPSUCCESSFUL',
            };

            authService.firebaseSignUp = jest.fn().mockResolvedValue(mockResponse);

            const signUpDto: SignUpDto = {
                email: 'b1@example.com',
                username: 'TestUser',
                password: 'Vitra/?123',
                name: 'Juan Lopez',
                security_answer: 'perfect blue',
            };

            const response = await request(app.getHttpServer())
                .post('/auth/firebase/signup')
                .send(signUpDto);

            expect(response.status).toBe(HttpStatus.CREATED);
            expect(response.body).toEqual({
                statusCode: mockResponse.statusCode,
                message: mockResponse.message,
            });
        });
    });
});
