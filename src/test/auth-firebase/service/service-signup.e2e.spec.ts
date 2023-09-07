import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { AppModule } from '../../../app.module';
import { SignUpDto } from '../../../auth/dto/signup.dto';
import { SignUpDtoResponse } from '../../../auth/dto/signupResponse.dto';

describe('AuthService (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [AuthService],
        }).compile();

        app = moduleFixture.createNestApplication();
        authService = moduleFixture.get<AuthService>(AuthService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/users (POST) should return a valid signup response', async () => {
        const signUpDto: SignUpDto = {
            email: 'test4546@example.com',
            username: 'testuser222',
            password: 'password123',
        };

        const response = await request(app.getHttpServer())
            .post('/auth/users')
            .send(signUpDto)
            .expect(HttpStatus.CREATED);

        const expectedResponse: SignUpDtoResponse = {
            statusCode: expect.any(Number),
            message: 'User registration successful',
            userId: expect.any(String),
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
