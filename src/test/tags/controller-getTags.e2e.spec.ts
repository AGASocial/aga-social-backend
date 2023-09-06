import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { GetTagsResponseDto } from '../../tags/dto/getTags.dto';
describe('TagsController (E2E)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/tags (GET)', async () => {
        const id = '1w54iIFPN0M7YNgo10XuLIVUkJk2';

        const response = await request(app.getHttpServer())
            .get(`/tags?id=${id}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('statusCode', 200); 

        expect(response.body.data).toBeInstanceOf(GetTagsResponseDto);
    });
});
