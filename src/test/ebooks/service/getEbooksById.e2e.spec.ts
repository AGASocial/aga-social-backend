import { Test, TestingModule } from '@nestjs/testing';
import { EbookService } from '../../../ebooks/ebooks.service';
import { EbookModule } from '../../../ebooks/ebooks.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GetEbookByIdResponseDto } from '../../../ebooks/dto/getEbookByIdResponse.dto';

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

    it('should get a specific ebook by ID', async () => {
        const ebookId = '65c8cf10-3726-4776-a35a-b0e5867dcf64';

        const response: GetEbookByIdResponseDto = await ebookService.getEbookById(ebookId);

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        expect(response.message).toBe('EBOOKRETRIEVEDSUCCESSFULLY');
        expect(response.ebookFound).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
