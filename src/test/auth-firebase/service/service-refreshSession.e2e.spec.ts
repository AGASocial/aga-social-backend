import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { AppModule } from '../../../app.module';
import { RefreshDto } from '../../../auth/dto/refresh.dto';
import { RefreshResponseDto } from '../../../auth/dto/refreshResponse.dto';

describe('AuthService (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/users/sessions (PUT) should return a valid refresh response', async () => {
        const refreshDto: RefreshDto = {
            refresh_token: 'test123', 
        };

        const response = await request(app.getHttpServer())
            .put('/auth/firebaseRefresh') 
            .send(refreshDto)
            .expect(HttpStatus.OK); 

        const expectedResponse: RefreshResponseDto = {
            statusCode: expect.any(Number),
            message: 'SESSIONREFRESHED', 
            bearer_token: expect.stringMatching(/^Bearer /),
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
