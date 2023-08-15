import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../../../auth/auth.module'; 
import { FirebaseService } from '../../../firebase/firebase.service'; 
describe('AuthService (e2e)', () => {
    let app: INestApplication;

   
    const firebaseServiceMock = {
        usersCollection: {}, 
        getCollectionData: jest.fn().mockReturnValue([]),
        setCollectionData: jest.fn(),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
            providers: [
                {
                    provide: FirebaseService,
                    useValue: firebaseServiceMock,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/firebase/delete (DELETE)', async () => {
       
        const deleteUserDto = {
            email: 'joel113@gmail.com',
            security_answer: 'perfect blue',
        };

       
        const response = await request(app.getHttpServer())
            .delete('/auth/firebase/delete')
            .send(deleteUserDto)
            .expect(500);

       

















        expect(response.body.statusCode).toEqual(500);
    });
});
