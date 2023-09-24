import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { ManageResourceStatusInSubsectionDto } from '../../../sections/dto/manageResourceStatusInSubsection.dto';
import { ManageResourceStatusInSectionResponseDto } from '../../../sections/dto/manageResourceStatusInSectionResponse.dto';

describe('SectionController (E2E)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule], 
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should manage resource status for subsections', async () => {
        const manageResourceStatusDto: ManageResourceStatusInSubsectionDto = {
            SectionId: '5f5ab735-9c7b-4450-bd14-c981249897c8',
            SubsectionId: '93612553-1aff-41ff-9bad-5c22f572ac9f', 
            active: true, 
            assetIds: ["609c916c-ebde-44d1-b55a-7e321541e860"], 
        };

        const response = await request(app.getHttpServer())
            .patch('/sections/subsections')
            .send(manageResourceStatusDto)
            .expect(201);

        expect(response.body).toMatchObject<ManageResourceStatusInSectionResponseDto>({
            statusCode: 201,
            message: 'RESOURCEUPDATEDSUCCESSFULLY',
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
