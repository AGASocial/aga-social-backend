import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { AuthModule } from '../../../auth/auth.module';
import { ChangeUsernameDto } from '../../../auth/dto/changeUsername.dto';

describe('AuthService (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        authService = moduleFixture.get<AuthService>(AuthService);
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/firebase/users/username (PUT)', async () => {
        const changeUsernameDto: ChangeUsernameDto = {
            password: "Vitra/?13",
            username: "Updated.1",
            email: "new_email@example.com"
        };

        const jwtToken = 'your_jwt_token_here';

        const response = await request(app.getHttpServer())
            .put('/auth/firebase/users/username')
            .set('Cookie', `refresh_token=${jwtToken}`)
            .send(changeUsernameDto)


























        expect(response.body.statusCode).toBe(500);
    });
});
