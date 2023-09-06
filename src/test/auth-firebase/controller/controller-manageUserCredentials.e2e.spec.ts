import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { ChangeSecurityAnswerDto } from '../../../auth/dto/changeSecurityAnswer.dto';
import { ChangeSecurityAnswerDtoResponse } from '../../../auth/dto/changeSecurityAnswerResponse.dto';
import { ChangePasswordDto } from '../../../auth/dto/changePassword.dto';
import { ChangePasswordDtoResponse } from '../../../auth/dto/changePasswordResponse.dto';
import { RecoverPasswordDto } from '../../../auth/dto/recoverPassword.dto';
import { RecoverPasswordDtoResponse } from '../../../auth/dto/recoverPasswordResponse.dto';

describe('Nombre de tu Controlador (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule], 
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/users (PATCH) Change Security Answer', async () => {
        const credentials: ChangeSecurityAnswerDto = {
            password: 'Vitra/?13',
            new_security_answer: 'perfect blue',
        };

        const response = await request(app.getHttpServer())
            .patch('/users')
            .send(credentials)
            .expect(HttpStatus.OK);

        const expectedResponse: ChangeSecurityAnswerDtoResponse = {
            statusCode: expect.any(Number),
            message: 'NEWSECURITYANSWERASSIGNED',
        };

        expect(response.body).toMatchObject(expectedResponse);
    });

    it('/users (PATCH) Change Password', async () => {
        const credentials: ChangePasswordDto = {
            password: 'Vitra/?13',
            new_password: 'Vitra/?134',
        };

        const response = await request(app.getHttpServer())
            .patch('/users')
            .send(credentials)
            .expect(HttpStatus.OK); 

        const expectedResponse: ChangePasswordDtoResponse = {
            statusCode: expect.any(Number),
            message: 'NEWPASSWORDASSIGNED',
        };

        expect(response.body).toMatchObject(expectedResponse);
    });

    it('/users (PATCH) Recover Password', async () => {
        const credentials: RecoverPasswordDto = {
            id: 'your_id',
            security_answer: 'perfect blue',
            new_password: 'Vitra/?13',
        };

        const response = await request(app.getHttpServer())
            .patch('/users')
            .send(credentials)
            .expect(HttpStatus.OK); 

        const expectedResponse: RecoverPasswordDtoResponse = {
            statusCode: expect.any(Number),
            message: 'NEWPASSWORDASSIGNED',
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
