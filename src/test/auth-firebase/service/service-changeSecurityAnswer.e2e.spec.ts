import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { ChangeSecurityAnswerDto } from '../../../auth/dto/changeSecurityAnswer.dto';
import { ChangeSecurityAnswerDtoResponse } from '../../../auth/dto/changeSecurityAnswerResponse.dto';

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

    it('/auth/users (PATCH) should change the security answer successfully', async () => {
        const jwtToken = 'token123';
        const changeSecurityAnswerDto: ChangeSecurityAnswerDto = {
            password: 'NewPass123/.',
            new_security_answer: 'perfect blue',
        };

        const response = await request(app.getHttpServer())
            .patch('/auth/users')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(changeSecurityAnswerDto)
            .expect(HttpStatus.OK);

        const expectedResponse: ChangeSecurityAnswerDtoResponse = {
            statusCode: expect.any(Number),
            message: expect.any(String),
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
