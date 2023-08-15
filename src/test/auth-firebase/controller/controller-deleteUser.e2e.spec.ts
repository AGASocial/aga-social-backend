import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { AuthController } from '../../../auth/auth.controller';
import { DeleteUserResponseDto } from '../../../auth/dto/deleteUserResponse.dto';
import { DeleteUserDto } from '../../../auth/dto/deleteUser.dto';

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
                        firebaseDeleteUser: jest.fn(),
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

    describe('deleteUser', () => {
        it('should return status code and message from authService', async () => {
            const mockResponse: DeleteUserResponseDto = {
                statusCode: HttpStatus.OK,
                message: 'USERDELETED',
            };

            authService.firebaseDeleteUser = jest.fn().mockResolvedValue(mockResponse);

            const deleteUserDto: DeleteUserDto = {
                email: 'user@example.com',
                security_answer: 'MySecurityAnswer123',
            };

            const response = await request(app.getHttpServer())
                .delete('/auth/firebase/delete')
                .send(deleteUserDto);

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toEqual({
                statusCode: mockResponse.statusCode,
                message: mockResponse.message,
            });
        });
    });
});
