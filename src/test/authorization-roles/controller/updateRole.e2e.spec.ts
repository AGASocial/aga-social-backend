import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { UpdateRoleDto } from '../../../authorization/dto/updateRole.dto';
import { UpdateRoleResponseDto } from '../../../authorization/dto/updateRoleResponse.dto';

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

    it('/roles (PUT) should update a role successfully', async () => {
        const roleName = 'Subscriber123'; 
        const updateRoleDto: UpdateRoleDto = {
            description: 'Updated role description',
            default: false,
            active: false,
        };

        const response = await request(app.getHttpServer())
            .put(`/roles?name=${roleName}`)
            .send(updateRoleDto)
            .expect(HttpStatus.OK);

        const expectedResponse: UpdateRoleResponseDto = {
            statusCode: 200,
            message: 'ROLEUPDATED',
        };

        expect(response.body).toEqual(expectedResponse);
    });
});
