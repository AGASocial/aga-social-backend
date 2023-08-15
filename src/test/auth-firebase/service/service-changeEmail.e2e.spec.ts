import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../../../auth/auth.module';

describe('AuthService (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/firebase/users/email (PUT)', async () => {
        const jwtToken = 'your-valid-jwt-token';

        const changeEmailDto = {
            old_email: 'old_email@example.com',
            security_answer: 'your_security_answer',
            new_email: 'new_email@example.com',
        };

        const response = await request(app.getHttpServer())
            .put('/auth/firebase/users/email')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(changeEmailDto);






















        expect(response.body.statusCode).toBe(500);
    });
});
