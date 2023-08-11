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

    it('/auth/firebase/credentials (POST)', async () => {
        const recoverPasswordDto = {
            user: 'joel113@gmail.com',
            security_answer: 'perfect blue',
            new_password: 'newpassword123?/',
        };

        const response = await request(app.getHttpServer())
            .post('/auth/firebase/credentials')
            .send(recoverPasswordDto)
            .expect(201);














        expect(response.body.statusCode).toEqual(201);
    });
});
