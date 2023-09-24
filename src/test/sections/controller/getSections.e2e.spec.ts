import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('SectionController (E2E)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule], 
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should get sections', async () => {
        const response = await request(app.getHttpServer())
            .get('/sections')
            .expect(200);

        expect(response.body).toMatchObject({
            statusCode: 200,
            message: 'SECTIONSRETRIEVEDSUCCESSFULLY',
            sectionsFound: expect.any(Array),
        });
    });

    it('should get sections by tags', async () => {
        const tags = ['programming', 'introduction'];

        const response = await request(app.getHttpServer())
            .get('/sections?tags=' + tags.join(','))
            .expect(200);

        expect(response.body).toMatchObject({
            statusCode: 200,
            message: 'SECTIONSRETRIEVEDSUCCESSFULLY',
            sectionsFound: expect.any(Array),
        });
    });

    it('should get section content by ID', async () => {
        const sectionId = '68fb6c27-11d5-4a73-9f31-a15133d4ac55'; 

        const response = await request(app.getHttpServer())
            .get(`/sections?sectionId=${sectionId}`)
            .expect(200);

        expect(response.body).toMatchObject({
            statusCode: 200,
            message: 'SECTIONSRETRIEVEDSUCCESSFULLY',
            sectionsFound: expect.any(Array),
        });
    });

    it('should get sections by keywords', async () => {
        const keywords = ['programming', 'introduction'];

        const response = await request(app.getHttpServer())
            .get('/sections?keywords=' + keywords.join(','))
            .expect(200);

        expect(response.body).toMatchObject({
            statusCode: 200,
            message: 'SECTIONSRETRIEVEDSUCCESSFULLY',
            sectionsFound: expect.any(Array),
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
