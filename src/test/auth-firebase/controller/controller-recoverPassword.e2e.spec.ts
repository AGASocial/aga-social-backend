import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../auth/auth.controller';
import { AuthService } from '../../../auth/auth.service';
import { RecoverPasswordDto } from '../../../auth/dto/recoverPassword.dto';
import { RecoverPasswordDtoResponse } from '../../../auth/dto/recoverPasswordResponse.dto';

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
                        firebaseRecoverPassword: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('firebaseRecoverPassword', () => {
        it('should return recover password response', async () => {
            // Arrange
            const mockResponse: RecoverPasswordDtoResponse = {
                statusCode: 200,
                message: 'NEWPASSWORDASSIGNED',
            };

            const mockRecoverPasswordDto: RecoverPasswordDto = {
                user: 'Joel.114',
                security_answer: 'perfect blue',
                new_password: 'Vitra/?134',
            };

            authService.firebaseRecoverPassword = jest.fn().mockResolvedValue(mockResponse);

            // Act
            const result = await authController.firebaseRecoverPassword(mockRecoverPasswordDto);

            // Assert
            expect(result).toEqual(mockResponse);
            expect(authService.firebaseRecoverPassword).toHaveBeenCalledWith(mockRecoverPasswordDto);
        });
    });
});
