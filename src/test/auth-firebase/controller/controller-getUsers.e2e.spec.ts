import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { GetUsersResponseDto } from '../../../auth/dto/getUsersResponse.dto';
import { DocResult } from '../../../utils/docResult.entity';

describe('AuthController (e2e)', () => {
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

    it('/users (GET) all users', async () => {
        const response = await request(app.getHttpServer())
            .get('/users')
            .expect(HttpStatus.OK);

        const expectedResponse: GetUsersResponseDto = {
            statusCode: expect.any(Number),
            message: 'USERSRETRIEVEDSUCCESSFULLY',
            usersFound: expect.any(Array),
            earningsFound: expect.any(Array),
        };

        expect(response.body).toMatchObject(expectedResponse);
    });

    it('/users (GET) single user', async () => {
        const id = '1w54iIFPN0M7YNgo10XuLIVUkJk2';
        const response = await request(app.getHttpServer())
            .get(`/users?id=${id}`)
            .expect(HttpStatus.OK);

        const expectedResponse: GetUsersResponseDto = {
            statusCode: expect.any(Number),
            message: 'USERSRETRIEVEDSUCCESSFULLY',
            usersFound: expect.arrayContaining([expect.any(DocResult)]),
            earningsFound: expect.arrayContaining([expect.any(DocResult)]),
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
