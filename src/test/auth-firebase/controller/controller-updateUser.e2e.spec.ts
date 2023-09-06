import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from '../../../auth/auth.controller';
import { AuthService } from '../../../auth/auth.service';
import { UpdateUserDto } from '../../../auth/dto/updateUser.dto';
import { UpdateUserResponseDto } from '../../../auth/dto/updateUserResponse.dto';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('updateUser', () => {
        it('should return a valid response when updating user data', async () => {
            const id = '1w54iIFPN0M7YNgo10XuLIVUkJk2';
            const newData: Partial<UpdateUserDto> = {
                username: 'Test.1314',
                name: 'Juan Lopez',
            };

            const updateUserResponse: UpdateUserResponseDto = {
                statusCode: 200,
                message: 'USERUPDATED',
            };

            jest.spyOn(authService, 'updateUser').mockResolvedValue(updateUserResponse);

            const res: Partial<Response> = {
                send: jest.fn(),
            };

            await authController.updateUser(id, newData, undefined);

            expect(res.send).toHaveBeenCalledWith(updateUserResponse);
        });

        it('should return a valid response when uploading a profile picture', async () => {
            const id = '1w54iIFPN0M7YNgo10XuLIVUkJk2';

            // Mock profile picture as if it's a file uploaded via HTTP
            const profilePicture = {
                fieldname: 'profilePicture',
                originalname: 'profile.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: Buffer.from([0x01, 0x02, 0x03]), 
                size: 12345,
            };

            const updateUserResponse: UpdateUserResponseDto = {
                statusCode: 200,
                message: 'USERUPDATED',
            };

            jest.spyOn(authService, 'uploadProfilePicture').mockResolvedValue(updateUserResponse);

            const res: Partial<Response> = {
                send: jest.fn(),
            };

            await authController.updateUser(id, undefined, profilePicture);

            expect(res.send).toHaveBeenCalledWith(updateUserResponse);
        });

    });
});
