import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GetRolesResponseDto } from '../../../roles/dto/getRolesResponse.dto';
import { AppModule } from '../../../app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/roles (GET)', () => {
        const expectedResponse: GetRolesResponseDto = {
            statusCode: 200,
            message: 'ROLESGOT',
            rolesFound: [
            ] as any[],
        };

        return request(app.getHttpServer())
            .get('/roles')
            .expect(200)
            .expect(expectedResponse);
    });

    afterAll(async () => {
        await app.close();
    });
});
