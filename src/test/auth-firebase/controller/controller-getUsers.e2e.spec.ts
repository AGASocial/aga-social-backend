import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthController } from '../../../auth/auth.controller';
import { AuthService } from '../../../auth/auth.service';
import { GetUsersResponseDto } from '../../../auth/dto/getUsersResponse.dto';
import { DocResult } from '../../../utils/docResult.entity';

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
                        getUsers: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });


    const mockUsersFound: DocResult[] = [
        {
            id: '1',
            name: 'User 1',
        },
        {
            id: '2',
            name: 'User 2',
        },
    ];


    describe('getUsers', () => {
        it('should return users response', async () => {
            // Arrange
            const mockResponse: GetUsersResponseDto = {
                statusCode: 200,
                message: 'USERSFETCHED',
                usersFound: mockUsersFound,
            };

            const mockReq = {} as Request;

            authService.getUsers = jest.fn().mockResolvedValue(mockResponse);

            // Act
            const result = await authController.getUsers(mockReq);

            // Assert
            expect(result).toEqual(mockResponse);
            expect(authService.getUsers).toHaveBeenCalled();
        });
    });
});
