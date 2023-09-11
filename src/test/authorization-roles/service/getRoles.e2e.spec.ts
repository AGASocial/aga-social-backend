import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { GetRolesResponseDto } from '../../../roles/dto/getRolesResponse.dto';

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

    describe('getAllRoles', () => {
        it('should retrieve roles successfully', async () => {
            const result: GetRolesResponseDto = await service.getAllRoles();

            expect(result).toBeDefined();

            expect(result.rolesFound).toBeDefined();

        });
    });
});
