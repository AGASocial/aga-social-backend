import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { UpdateUserDto } from '../../../auth/dto/updateUser.dto';
import { UpdateUserResponseDto } from '../../../auth/dto/updateUserResponse.dto';

describe('UserService (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/users (PUT) should update user data successfully', async () => {
        const id = 'nyoBoIroCqNTL7FnInQohxF7t7I2'; 
        const newData: UpdateUserDto = {
            username: 'username',
            name: 'name',
            description: '...',
            country: 'Venezuela',
            phoneNumber: '04245897856',
            active: true,
        };

        const response = await request(app.getHttpServer())
            .put(`auth/users`)
            .send(newData)
            .expect(HttpStatus.OK);

        const expectedResponse: UpdateUserResponseDto = {
            statusCode: expect.any(Number),
            message: expect.any(String),
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
