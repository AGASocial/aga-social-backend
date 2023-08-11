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

    it('/auth/firebase/users/username (PUT)', async () => {
        const jwtToken = 'your-valid-jwt-token';

        const changeUsernameDto = {
            password: 'Vitra/?13',
            username: 'Updated.1',
            email: 'new_email@example.com',
        };

        const response = await request(app.getHttpServer())
            .put('/auth/firebase/users/username')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(changeUsernameDto);






























        expect(response.body.statusCode).toBe(500);
    });
});
