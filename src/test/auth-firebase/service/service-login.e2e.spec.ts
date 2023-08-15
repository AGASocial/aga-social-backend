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

    it('/auth/firebase/login (POST)', async () => {
        const logInDto = {
            email: 'joel113@gmail.com',
            password: 'Vitra/?13',
        };

        const response = await request(app.getHttpServer())
            .post('/auth/firebase/login')
            .send(logInDto)












        expect(response.body.statusCode).toEqual(500);
    });
});
