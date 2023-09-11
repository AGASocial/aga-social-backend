import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { SetRoleToUserResponseDto } from '../../../authorization/dto/setRoleToUserResponse.dto';

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

    it('/users/roles (PUT) should set a role to a user successfully', async () => {
        const userDto = {
            id: 'XUG7QW1LkJVHXHZXeJtO30IqDjW2', 
            role: 'Subscriber123', 
        };

        const response = await request(app.getHttpServer())
            .put('/users/roles')
            .send(userDto)
            .expect(HttpStatus.OK);

        const expectedResponse: SetRoleToUserResponseDto = {
            statusCode: 200,
            message: 'ROLESETTOUSER',
        };

        expect(response.body).toEqual(expectedResponse);
    });
});
