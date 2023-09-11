import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { CreateNewRoleDto } from '../../../authorization/dto/createNewRole.dto';
import { CreateNewRoleResponseDto } from '../../../authorization/dto/createNewRoleResponse.dto';

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

    describe('createNewRole', () => {
        it('should create a new role', async () => {
            const createNewRoleDto: CreateNewRoleDto = {
                name: 'TestRole566',
                description: 'Test Role Description',
                default: true,
                active: true,
            };

            const result: CreateNewRoleResponseDto = await service.createNewRole(createNewRoleDto);

            expect(result).toBeDefined();
            expect(result.message).toBe('ROLECREATED');
            expect(result.roleId).toBeDefined();
        });
    });
});
