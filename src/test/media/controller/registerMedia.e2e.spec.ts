import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('MediaController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/assets/media/users (POST) - should register media', async () => {
        const createMediaDto = {
            type: 'audio',
            title: 'Test Media',
            description: 'Test Description',
            duration: '00:05:00',
            publisher: 'Mary.123',
            url: 'https://example.com/test-media.mp3',
            uploadDate: '2023-08-15T00:00:00.000Z',
        };

        const response = await request(app.getHttpServer())
            .post('/assets/media/users')
            .send(createMediaDto)
            .expect(201);

        const responseBody = response.body;
        expect(responseBody).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
