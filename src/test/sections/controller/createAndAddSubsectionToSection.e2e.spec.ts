import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateSectionDto } from '../../../sections/dto/createSection.dto';
import { AppModule } from '../../../app.module';
import { CreateSectionResponseDto } from '../../../sections/dto/createSectionResponse.dto';

describe('SectionController (E2E)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should create and add a new subsection to a parent section', async () => {
        const createSectionDto: CreateSectionDto = {
            name: 'Introduction to Programming',
            description: 'A comprehensive introduction to basic programming concepts',
            tags: ['programming', 'introduction', 'development'],
            assetsIds: ["0c5ca282-18e9-4c2f-b04f-d97e190e24d4"],
        };

        const parentSectionId = '5f5ab735-9c7b-4450-bd14-c981249897c8';

        const response = await request(app.getHttpServer())
            .post(`/sections/subsections?parentSectionId=${parentSectionId}`)
            .send(createSectionDto)
            .expect(201);

        expect(response.body).toMatchObject<CreateSectionResponseDto>({
            statusCode: 201,
            message: 'SECTIONCREATEDSUCCESSFULLY',
            sectionId: expect.any(String),
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
