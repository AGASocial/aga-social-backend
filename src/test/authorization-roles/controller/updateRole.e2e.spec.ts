import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthorizationModule } from '../../../authorization/authorization.module'; 
import { UpdateRoleDto } from '../../../authorization/dto/updateRole.dto'; 

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

    it('/authorization/firebase/roles/:name (PUT)', async () => {
        const roleName = 'Admin';

        const updateRoleDto: Partial<UpdateRoleDto> = {
            description: 'Updated role description',
            isDefault: true,
           
        };

        const response = await request(app.getHttpServer())
            .put(`/authorization/firebase/roles/${roleName}`)
            .send(updateRoleDto)

        const responseBody: any = response.body; 



















        expect(responseBody.statusCode).toEqual(500);
    });
});
