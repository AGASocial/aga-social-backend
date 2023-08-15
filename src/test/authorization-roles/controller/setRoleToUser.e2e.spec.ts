import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthorizationModule } from '../../../authorization/authorization.module'; 
import { SetRoleToUserResponseDto } from '../../../authorization/dto/setRoleToUserResponse.dto'; 

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

    it('/authorization/firebase/users/:email/roles/:roleName (PUT)', async () => {
        const email = 'joel114@gmail.com'; 
        const roleName = 'Publisher';
        const response = await request(app.getHttpServer())
            .put(`/authorization/firebase/users/${email}/roles/${roleName}`)

        const responseBody: SetRoleToUserResponseDto = response.body;


































        expect(responseBody.statusCode).toEqual(500);
    });
});
