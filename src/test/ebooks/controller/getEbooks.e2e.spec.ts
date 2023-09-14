import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { GetEbooksResponseDto } from '../../../ebooks/dto/getEbooksResponse.dto';
import { GetEbookByIdResponseDto } from '../../../ebooks/dto/getEbookByIdResponse.dto';

describe('EbookController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/assets/ebooks (GET) - should get all ebooks', async () => {
        const response = await request(app.getHttpServer())
            .get('/assets/ebooks')
            .expect(200);

        const responseBody: GetEbooksResponseDto = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.statusCode).toBe(200);
        expect(responseBody.message).toBe('EBOOKSRETRIEVEDSUCCESSFULLY');
    });

    it('/assets/ebooks (GET) - should get ebooks by keywords', async () => {
        const keywords = ['tutorial'];

        const response = await request(app.getHttpServer())
            .get(`/assets/ebooks?keywords=${keywords.join(',')}`)
            .expect(200);

        const responseBody: GetEbooksResponseDto = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.statusCode).toBe(200);
    });

    it('/assets/ebooks (GET) - should get an ebook by ID', async () => {
        const ebookId = '65c8cf10-3726-4776-a35a-b0e5867dcf64';

        const response = await request(app.getHttpServer())
            .get(`/assets/ebooks?id=${ebookId}`)
            .expect(200);

        const responseBody: GetEbookByIdResponseDto = response.body;
        expect(responseBody).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
