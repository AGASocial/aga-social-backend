import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../auth/auth.controller';
import { AuthService } from '../../../auth/auth.service';
import { ChangePasswordDto } from '../../../auth/dto/changePassword.dto';
import { ChangePasswordDtoResponse } from '../../../auth/dto/changePasswordResponse.dto';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        firebaseChangePassword: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('firebaseChangePassword', () => {
        it('should return change password response', async () => {
            const mockResponse: ChangePasswordDtoResponse = {
                statusCode: 200,
                message: 'PASSWORDCHANGED',
            };

            const mockChangePasswordDto: ChangePasswordDto = {
                password: 'Vitra/?13',
                new_password: 'Vitra/?1345',
            };

            const mockJwtToken = 'mock_jwt_token';

            authService.firebaseChangePassword = jest.fn().mockResolvedValue(mockResponse);

            const result = await authController.firebaseChangePassword(mockChangePasswordDto, { signedCookies: { refresh_token: mockJwtToken } } as any);

            expect(result).toEqual(mockResponse);
            expect(authService.firebaseChangePassword).toHaveBeenCalledWith(mockChangePasswordDto, mockJwtToken);
        });
    });
});
