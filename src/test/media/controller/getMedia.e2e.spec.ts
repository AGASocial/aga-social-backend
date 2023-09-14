import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { Media } from '../../../media/entities/media.entity';

describe('MediaController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/assets/media (GET) - should retrieve all media', async () => {
        const response = await request(app.getHttpServer())
            .get('/assets/media')
            .expect(200);

        const responseBody = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.statusCode).toBe(201);
        expect(responseBody.message).toBe('MEDIARETRIEVEDSUCCESSFULLY');
        expect(responseBody.mediaFound).toEqual(expect.any(Array));
    });

    it('/assets/media (GET) - should retrieve media by keywords', async () => {
        const keywords = ['audio'];
        const response = await request(app.getHttpServer())
            .get(`/assets/media?keywords=${keywords.join(',')}`)
            .expect(200);

        const responseBody = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.message).toBe('MEDIARETRIEVEDSUCCESSFULLY');
        expect(responseBody.mediaFound).toEqual(expect.any(Array));
    });

    it('/assets/media (GET) - should retrieve media by ID', async () => {
        const mediaId = 'e19e073f-cdde-4b96-a3b2-c0aba097dbbc';
        const response = await request(app.getHttpServer())
            .get(`/assets/media?id=${mediaId}`)
            .expect(200);

        const responseBody = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.message).toBe('MEDIARETRIEVEDSUCCESSFULLY');
        expect(responseBody.mediaFound).toEqual(expect.any(Media));
    });

    afterAll(async () => {
        await app.close();
    });
});
