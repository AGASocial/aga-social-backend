import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
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

    it('auth/users (PUT) should upload profile picture successfully', async () => {
        const id = 'nyoBoIroCqNTL7FnInQohxF7t7I2';
        const file = {
            buffer: Buffer.from('image'), 
            originalname: 'nombre_de_la_imagen.png', 
            size: 1024, 
            mimetype: 'image/png', 
        };

        const response = await request(app.getHttpServer())
            .put(`auth/users`)
            .attach('file', file.buffer, file.originalname)
            .expect(HttpStatus.OK);

        const expectedResponse: UpdateUserResponseDto = {
            statusCode: expect.any(Number),
            message: 'USERUPDATEDSUCCESSFULLY',
        };

        expect(response.body).toMatchObject(expectedResponse);
    });
});
