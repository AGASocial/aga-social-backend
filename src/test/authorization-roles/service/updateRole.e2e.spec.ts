import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { UpdateRoleDto } from '../../../authorization/dto/updateRole.dto';
import { UpdateRoleResponseDto } from '../../../authorization/dto/updateRoleResponse.dto';

describe('AuthorizationService', () => {
    let service: AuthorizationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        service = module.get<AuthorizationService>(AuthorizationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('updateRole', () => {
        it('should update a role successfully', async () => {
            const roleName = 'TestRole566';
            const newData: UpdateRoleDto = {
                description: 'Updated Role Description',
                default: false,
                active: false,
            };

            const result: UpdateRoleResponseDto = await service.updateRole(roleName, newData);

            expect(result).toBeDefined();
            expect(result.message).toBe('ROLEUPDATED');

        });
    });
});
