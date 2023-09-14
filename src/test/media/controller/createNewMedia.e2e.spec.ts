import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { MediaType } from '../../../media/entities/media.entity';

describe('MediaController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/assets/media (POST) - should upload and create media', async () => {
        const publisher = 'TestPublisher';
        const type: MediaType = MediaType.Audio;
        const title = 'Test Title';
        const description = 'Test Description';
        const duration = '00:05:00';
        const uploadDate = '2023-08-15T00:00:00.000Z';

        const fileMock = {
            fieldname: 'file',
            originalname: 'test.mp3',
            encoding: '7bit',
            mimetype: 'audio/mpeg',
            buffer: Buffer.from('content'),
            size: 12345,
        };

        const response = await request(app.getHttpServer())
            .post('/assets/media')
            .field('publisher', publisher)
            .field('type', type)
            .field('title', title)
            .field('description', description)
            .field('duration', duration)
            .field('uploadDate', uploadDate)
            .attach('file', fileMock.buffer, {
                filename: fileMock.originalname,
                contentType: fileMock.mimetype,
            })
            .expect(200);

        const responseBody = response.body;
        expect(responseBody).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
