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

    it('should add media or ebook to a subsection', async () => {
        const requestBody = {
            sectionId: '5f5ab735-9c7b-4450-bd14-c981249897c8', 
            subsectionId: '93612553-1aff-41ff-9bad-5c22f572ac9f', 
            resourceId: '65c8cf10-3726-4776-a35a-b0e5867dcf64', 
        };

        const response = await request(app.getHttpServer())
            .patch('/sections/subsections/assets')
            .send(requestBody)
            .expect(200);

        expect(response.body).toMatchObject({
            statusCode: 200,
            message: 'MEDIAOREBOOKADDEDSUCCESSFULLY',
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
