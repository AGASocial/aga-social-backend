import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationService } from '../../../authorization/authorization.service';
import { SetRoleToUserDto } from '../../../authorization/dto/setRoleToUser.dto';
import { SetRoleToUserResponseDto } from '../../../authorization/dto/setRoleToUserResponse.dto';

describe('AuthorizationService', () => {
    let service: AuthorizationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthorizationService],
        }).compile();

        service = module.get<AuthorizationService>(AuthorizationService);
    });

    it('should set a role to a user', async () => {
        const userId = 'XUG7QW1LkJVHXHZXeJtO30IqDjW2';

        const setRoleDto = {
            role: 'Subscriber123',
        };

        const expectedResponse: SetRoleToUserResponseDto = {
            statusCode: 200,
            message: 'ROLESETTOUSER',
        };

        const result = await service.setRoleToUser(userId, setRoleDto.role);

        expect(result).toEqual(expectedResponse);
    });
});
