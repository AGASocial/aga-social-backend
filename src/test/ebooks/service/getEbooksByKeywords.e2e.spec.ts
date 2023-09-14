import { Test, TestingModule } from '@nestjs/testing';
import { EbookService } from '../../../ebooks/ebooks.service';
import { EbookModule } from '../../../ebooks/ebooks.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GetEbooksResponseDto } from '../../../ebooks/dto/getEbooksResponse.dto';

describe('EbookService (e2e)', () => {
    let app: INestApplication;
    let ebookService: EbookService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [EbookModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        ebookService = moduleFixture.get<EbookService>(EbookService);
    });

    it('should get ebooks by keywords', async () => {
        const keywords = ['vero']; 

        const response: GetEbooksResponseDto = await ebookService.getEbooksByKeywords(keywords);

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        expect(response.ebooksFound).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
