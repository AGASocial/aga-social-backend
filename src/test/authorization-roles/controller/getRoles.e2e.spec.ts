import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthorizationModule } from '../../../authorization/authorization.module'; 

describe('AuthorizationController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthorizationModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/authorization/firebase/roles (GET)', async () => {
        const response = await request(app.getHttpServer())
            .get('/authorization/firebase/roles')

        const responseBody: any = response.body; 




















        expect(responseBody.statusCode).toEqual(500);
    });
});
