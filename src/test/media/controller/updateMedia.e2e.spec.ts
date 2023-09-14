import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { UpdateMediaDto } from '../../../media/dto/updateMedia.dto';
import { UpdateMediaResponseDto } from '../../../media/dto/updateMediaResponse.dto';

describe('MediaController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/assets/media (PUT) - should update media', async () => {
        const mediaId = 'e19e073f-cdde-4b96-a3b2-c0aba097dbbc';
        const updateMediaDto: UpdateMediaDto = {
            title: 'Title of the content',
            description: 'Description of the content',
            duration: '00:15:30',
            active: true,
        };

        const response = await request(app.getHttpServer())
            .put(`/assets/media?id=${mediaId}`)
            .send(updateMediaDto)
            .expect(200);

        const responseBody: UpdateMediaResponseDto = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.statusCode).toBe(200);
    });

    afterAll(async () => {
        await app.close();
    });
});
