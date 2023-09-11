import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { CreateNewRoleDto } from '../../../authorization/dto/createNewRole.dto';

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

    it('/roles (POST) should create a new role successfully', async () => {
        const createNewRoleDto: CreateNewRoleDto = {
            name: 'Subscriber123',
            description: 'Subscribers are users that can buy courses and e-books offered by Publishers',
            default: true,
            active: true,
        };

        const response = await request(app.getHttpServer())
            .post('/roles')
            .send(createNewRoleDto)
            .expect(HttpStatus.OK);

        const expectedResponse = {
            statusCode: 201,
            message: 'ROLECREATED',
            roleId: expect.any(String), 
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
