import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { AuthService } from '../../../auth/auth.service';
import { GetUsersResponseDto } from '../../../auth/dto/getUsersResponse.dto';

describe('AuthService (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [AuthService],
        }).compile();

        app = moduleFixture.createNestApplication();
        authService = moduleFixture.get<AuthService>(AuthService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/getSingleUser/:id (GET) should retrieve a single user', async () => {
        const userId = 'tu_user_id_de_prueba'; 

        const response = await request(app.getHttpServer())
            .get(`/auth/getSingleUser/${userId}`)
            .expect(HttpStatus.OK);

        const expectedResponse: GetUsersResponseDto = {
            statusCode: expect.any(Number),
            message: expect.stringMatching(/^(USER_ACCOUNT_INFORMATION_RETRIEVED|USERNOTFOUND)$/),
            usersFound: expect.arrayContaining([expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                username: expect.any(String),
                role: expect.any(Array),
                purchasedBooks: expect.any(Array),
                purchasedCourses: expect.any(Array),
                courseEarnings: expect.any(Number),
                ebookEarnings: expect.any(Number),
                description: expect.any(String),
                country: expect.any(String),
                phoneNumber: expect.any(String),
                active: expect.any(Boolean),
                profilePicture: expect.any(String),
            })]),
            earningsFound: expect.arrayContaining([expect.objectContaining({

            })]),
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
