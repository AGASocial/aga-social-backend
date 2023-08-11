import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../../../auth/auth.module';
import { ChangeNameDto } from '../../../auth/dto/changeName.dto';

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

    it('/auth/firebase/users/name (PUT)', async () => {
        const jwtToken = 'your-valid-jwt-token';

        const changeNameDto: ChangeNameDto = {
            password: "Vitra/?13",
            name: "NewName",
            email: "new_email@example.com"
        };


        const response = await request(app.getHttpServer())
            .put('/auth/firebase/users/name')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(changeNameDto);

























        expect(response.body.statusCode).toBe(500);
    });
});
