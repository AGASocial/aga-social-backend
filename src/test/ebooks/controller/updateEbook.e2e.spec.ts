import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { UpdateEbookDto } from '../../../ebooks/dto/updateEbook.dto';
import { UpdateEbookResponseDto } from '../../../ebooks/dto/updateEbookResponse.dto';

describe('EbookController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/assets/ebooks (PUT) - should update an ebook', async () => {
        const ebookId = 'b06b40f0-801d-4074-a3e5-1c6fe19d56bc';

        const updateEbookDto: UpdateEbookDto = {
            title: 'Updated Title',
            description: 'Updated Description',
        };

        const response = await request(app.getHttpServer())
            .put(`/assets/ebooks?id=${ebookId}`)
            .send(updateEbookDto)
            .expect(200);

        const responseBody: UpdateEbookResponseDto = response.body;
        expect(responseBody).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
