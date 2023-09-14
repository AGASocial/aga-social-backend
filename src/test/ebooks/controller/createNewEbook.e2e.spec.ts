import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { EbookService } from '../../../ebooks/ebooks.service';
import { CreateEbookDto } from '../../../ebooks/dto/createEbook.dto';
import { EbookFormat, EbookGenre } from '../../../ebooks/entities/ebooks.entity';

describe('EbookController (e2e)', () => {
    let app: INestApplication;
    let ebookService: EbookService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        ebookService = moduleFixture.get<EbookService>(EbookService);
    });

    it('/assets/ebooks (POST) - should upload and create an ebook', async () => {
        const mockEbookFile = {
            originalname: 'sample-ebook.pdf',
            buffer: Buffer.from('Mock ebook content'), 
        };

        const createEbookDto: CreateEbookDto = {
            titlePage: 'Sample Title Page',
            title: 'Sample Ebook Title',
            description: 'Sample Ebook Description',
            author: ['Author 1', 'Author 2'],
            releaseDate: new Date(),
            price: 10.99,
            language: ['English'],
            pageCount: 300,
            genres: [EbookGenre.Biography],
            format: EbookFormat.PDF,
            publisher: 'Sample Publisher',
        };

        const response = await request(app.getHttpServer())
            .post('/assets/ebooks')
            .attach('file', mockEbookFile.buffer, mockEbookFile.originalname)
            .send(createEbookDto)

        expect(response.body).toBeDefined();
        expect(response.body.ebookId).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
