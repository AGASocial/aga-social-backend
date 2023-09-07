import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { AppModule } from '../../../app.module';
import { LogInDto } from '../../../auth/dto/login.dto';
import { LogInResponseDto } from '../../../auth/dto/loginResponse.dto';

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

    it('/auth/users/sessions (POST) should return a valid login response', async () => {
        const logInDto: LogInDto = {
            email: 'frio2@gmail.com', 
            password: 'Vitra/?13', 
        };

        const response = await request(app.getHttpServer())
            .post('/auth/firebaseLogin') 
            .send(logInDto)
            .expect(HttpStatus.OK);

        const expectedResponse: LogInResponseDto = {
            statusCode: expect.any(Number),
            message: 'Login successful',
            userId: expect.any(String),
            bearer_token: expect.stringMatching(/^Bearer /),
            authCookieAge: expect.any(Number),
            refresh_token: expect.stringMatching(/^Bearer /),
            refreshCookieAge: expect.any(Number),
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
