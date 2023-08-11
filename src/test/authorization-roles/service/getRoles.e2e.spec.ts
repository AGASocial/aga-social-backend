import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, InternalServerErrorException } from '@nestjs/common';
import * as request from 'supertest';
import { AuthorizationService } from '../../../authorization/authorization.service';
import { AuthorizationModule } from '../../../authorization/authorization.module';

describe('AuthorizationService (e2e)', () => {
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

    it('/authorization/firebase/roles (GET)', async () => {
        const response = await authorizationService.getAllRoles();
































            expect(response.statusCode).toBe(200);
    });
});
