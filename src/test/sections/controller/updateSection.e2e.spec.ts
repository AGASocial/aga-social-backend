import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UpdateSectionResponseDto } from '../../../sections/dto/updateSectionResponse.dto';
import { AppModule } from '../../../app.module';
import { UpdateSectionDto } from '../../../sections/dto/updateSection.dto';

describe('SectionController (E2E)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should update a section\'s details', async () => {
        const updateSectionDto: UpdateSectionDto = {
            name: 'Updated Introduction to Programming',
            description: 'An updated introduction to basic programming concepts',
            tags: ['programming', 'introduction', 'development'],
            active: true,
        };

        const sectionId = '5007e86e-54c3-43c0-b823-e4a14e41c75d';

        const response = await request(app.getHttpServer())
            .put(`/sections?id=${sectionId}`)
            .send(updateSectionDto)
            .expect(200);

        expect(response.body).toMatchObject<UpdateSectionResponseDto>({
            statusCode: 200,
            message: 'SECTIONUPDATEDSUCCESSFULLY',
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
