import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthorizationModule } from '../../../authorization/authorization.module'; 
import { CreateNewRoleDto } from '../../../authorization/dto/createNewRole.dto'; 

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

    it('/authorization/firebase/roles (POST)', async () => {
        const createNewRoleDto: CreateNewRoleDto = {
            name: 'newRole',
            description: 'New role description',
            isDefault: false,
            isActive: true,
        };

        const response = await request(app.getHttpServer())
            .post('/authorization/firebase/roles')
            .send(createNewRoleDto)

        const responseBody: any = response.body; 





















        expect(responseBody.statusCode).toEqual(500);
    });
});
