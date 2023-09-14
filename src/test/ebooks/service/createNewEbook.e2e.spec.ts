import { Test, TestingModule } from '@nestjs/testing';
import { EbookService } from '../../../ebooks/ebooks.service';
import { EbookModule } from '../../../ebooks/ebooks.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UploadEbookResponseDto } from '../../../ebooks/dto/uploadEbookResponse.dto';
import { CreateEbookDto } from '../../../ebooks/dto/createEbook.dto';
import { EbookFormat, EbookGenre } from '../../../ebooks/entities/ebooks.entity';

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

    it('should upload and create an ebook', async () => {
        const file = {
            originalname: 'example.pdf',
            mimetype: 'application/pdf',
            buffer: Buffer.from('content_pdf'),
            size: 1024 * 1024,
        };
        const createNewEbookDto: CreateEbookDto = {
            title: 'Introduction to Programming',
            description: 'A comprehensive guide to programming basics.',
            author: ['John Smith'],
            releaseDate: new Date('2023-08-01'),
            price: 19.99,
            language: ['English'],
            pageCount: 300,
            genres: [EbookGenre.ComputerScience],
            format: EbookFormat.PDF,
            publisher: 'example_publisher',
            titlePage: 'https://example.com/titlePage.pdf',
        };

      


        const response: UploadEbookResponseDto = await ebookService.uploadAndCreateEbook(file, createNewEbookDto);

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(201);
        expect(response.message).toBe('EBOOKUPLOADEDSUCCESSFULLY');
        expect(response.ebookId).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
