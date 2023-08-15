import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../../../auth/auth.module';
import { ChangeEmailDto } from '../../../auth/dto/changeEmail.dto';

describe('AuthorizationController (e2e)', () => {
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

    it('/authorization/firebase/users/email (PUT)', async () => {
        const changeEmailDto: ChangeEmailDto = {
            old_email: "new_email@example.com",
            security_answer: "perfect blue",
            new_email: "new_email22@example.com"
        };

        const jwtToken = 'your_jwt_token_here';

        const response = await request(app.getHttpServer())
            .put('/authorization/firebase/users/email')
            .set('Cookie', `refresh_token=${jwtToken}`)
            .send(changeEmailDto)



























        expect(response.body.statusCode).toBe(500);
        });
    });

