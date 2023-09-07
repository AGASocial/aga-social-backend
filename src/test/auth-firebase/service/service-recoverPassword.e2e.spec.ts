import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { AppModule } from '../../../app.module';
import { RecoverPasswordDto } from '../../../auth/dto/recoverPassword.dto';
import { RecoverPasswordDtoResponse } from '../../../auth/dto/recoverPasswordResponse.dto';

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

    it('/auth/users (PATCH) should recover the password', async () => {
        const recoverPasswordDto: RecoverPasswordDto = {
            
            security_answer: 'perfect blue',
            new_password: 'NewPass123/.',
        };

        const jwtToken = 'token123';

        const response = await request(app.getHttpServer())
            .patch('/auth/users')
            .send(recoverPasswordDto)
            .set('Authorization', `Bearer ${jwtToken}`)

        const expectedResponse: RecoverPasswordDtoResponse = {
            statusCode: expect.any(Number),
            message: expect.any(String),
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
