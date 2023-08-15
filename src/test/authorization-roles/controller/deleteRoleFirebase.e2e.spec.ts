import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthorizationModule } from '../../../authorization/authorization.module'; 
import { DeleteRoleOfUserResponseDto } from '../../../authorization/dto/deleteRoleOfUserResponse.dto';

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

    it('/authorization/firebase/roles/:roleName (DELETE)', async () => {
        const roleName = 'Publisher'; 
        const response = await request(app.getHttpServer())
            .delete(`/authorization/firebase/roles/${roleName}`)

        const responseBody: DeleteRoleOfUserResponseDto = response.body;























        expect(responseBody.statusCode).toEqual(500);
    });
});
