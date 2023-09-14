import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EbookService } from '../../../ebooks/ebooks.service';
import { EbookModule } from '../../../ebooks/ebooks.module';
import { UpdateEbookDto } from '../../../ebooks/dto/updateEbook.dto';
import { UpdateEbookResponseDto } from '../../../ebooks/dto/updateEbookResponse.dto';

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

    it('should update ebook data', async () => {
        const ebookId = '65c8cf10-3726-4776-a35a-b0e5867dcf64';
        const updateData: UpdateEbookDto = {
            title: 'ABC',
            author: ['Mary'],
        };

        const response: UpdateEbookResponseDto = await ebookService.updateEbook(ebookId, updateData);

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        expect(response.message).toBe('EBOOKUPDATEDSUCCESSFULLY');
    });

    afterAll(async () => {
        await app.close();
    });
});
