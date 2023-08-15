import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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

    it('/auth/firebase/signup (POST)', async () => {
        const signUpDto = {
            email: 'test477@example.com',
            username: 'testuser.12',
            password: 'testpassword/?1',
            name: 'Test User',
            security_answer: 'securityanswer22',
        };

        const response = await request(app.getHttpServer())
            .post('/auth/firebase/signup')
            .send(signUpDto)






















        expect(response.body.statusCode).toEqual(400);
    });
});
