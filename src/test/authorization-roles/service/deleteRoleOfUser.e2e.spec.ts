import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DeleteRoleOfUserResponseDto } from '../../../authorization/dto/deleteRoleOfUserResponse.dto';
import { AuthorizationService } from '../../../authorization/authorization.service'; 
import { AppModule } from '../../../app.module';

describe('AuthorizationService (e2e)', () => {
    let app: INestApplication;
    let service: AuthorizationService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        service = moduleFixture.get<AuthorizationService>(AuthorizationService);
    });

    it('should delete a role from a user', async () => {
        const userId = 'XUG7QW1LkJVHXHZXeJtO30IqDjW2';
        const roleNameToDelete = 'Subscriber123';

        const response: DeleteRoleOfUserResponseDto = await service.deleteRoleOfUser(userId, roleNameToDelete);

        expect(response.statusCode).toBe(200);
        expect(response.message).toBe('ROLEREVOKED');
    });

    afterAll(async () => {
        await app.close();
    });
});
