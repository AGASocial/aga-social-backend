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

    it('/auth/firebase/credentials (PUT)', async () => {
        const jwtToken = 'your-valid-jwt-token';

        const changePasswordDto = {
            password: 'Vitra/?13',
            new_password: 'Vitra/?134',
        };

        const response = await request(app.getHttpServer())
            .put('/auth/firebase/credentials')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(changePasswordDto)




















        expect(response.body.statusCode).toBe(500);
    });
});
