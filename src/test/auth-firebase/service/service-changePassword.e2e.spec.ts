import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { AppModule } from '../../../app.module';
import { ChangePasswordDto } from '../../../auth/dto/changePassword.dto';
import { ChangePasswordDtoResponse } from '../../../auth/dto/changePasswordResponse.dto';

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

    it('/auth/users (PATCH) should change the password', async () => {
        const changePasswordDto: ChangePasswordDto = {
            password: 'NewPass123/.',
            new_password: 'NewPass1234',
        };

        const jwtToken = 'token123';

        const response = await request(app.getHttpServer())
            .patch('/auth/users')
            .send(changePasswordDto)
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(HttpStatus.OK);

        const expectedResponse: ChangePasswordDtoResponse = {
            statusCode: expect.any(Number),
            message: 'NEWPASSWORDASSIGNED',
        };

        expect(response.body).toMatchObject(expectedResponse);
    });

 
});
