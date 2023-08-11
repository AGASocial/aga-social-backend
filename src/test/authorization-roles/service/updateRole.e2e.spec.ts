import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as request from 'supertest';
import { AuthorizationService } from '../../../authorization/authorization.service';
import { AuthorizationModule } from '../../../authorization/authorization.module';

describe('AuthorizationController (e2e)', () => {
    let app: INestApplication;
    let authorizationService: AuthorizationService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthorizationModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        authorizationService = moduleFixture.get<AuthorizationService>(AuthorizationService);
    });

    afterAll(async () => {
        await app.close();
    });

    it('/authorization/firebase/roles/:name (PUT)', async () => {
        const roleName = 'Subscriber'; 
        const newData = {
            description: 'Updated role description',
            isDefault: true,
            isActive: false,
        };

        const response = await request(app.getHttpServer())
            .put(`/authorization/firebase/roles/${roleName}`)
            .send(newData)

























        expect(response.body.statusCode).toBe(500);
    });
});
