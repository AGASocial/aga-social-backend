import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { GetSectionsResponseDto } from '../../../sections/dto/getSectionResponse.dto';

describe('SectionController (E2E)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule], 
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should get subsections by section ID', async () => {
        const sectionId = '5f5ab735-9c7b-4450-bd14-c981249897c8'; 

        const response = await request(app.getHttpServer())
            .get(`/sections/subsections?id=${sectionId}`)
            .expect(200);

        expect(response.body).toMatchObject<GetSectionsResponseDto>({
            statusCode: 200,
            message: 'SECTIONSRETRIEVEDSUCCESSFULLY',
            sectionsFound: expect.any(Array), 
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
