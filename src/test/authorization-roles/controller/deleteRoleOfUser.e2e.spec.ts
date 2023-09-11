import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { DeleteRoleOfUserResponseDto } from '../../../authorization/dto/deleteRoleOfUserResponse.dto';

describe('RoleController (e2e)', () => {
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

    it('/users/roles (DELETE) should delete a role from a user successfully', async () => {
        const userId = 'XUG7QW1LkJVHXHZXeJtO30IqDjW2';
        const roleName = 'Subscriber123';

        const response = await request(app.getHttpServer())
            .delete(`/users/roles?id=${userId}&roleName=${roleName}`)
            .expect(HttpStatus.OK);

        const expectedResponse: DeleteRoleOfUserResponseDto = {
            statusCode: 200,
            message: 'ROLEREVOKED' as any,
        };

        expect(response.body).toEqual(expectedResponse);
    });
});
