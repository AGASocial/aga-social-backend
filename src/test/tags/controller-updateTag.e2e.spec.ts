import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { UpdateTagDto } from '../../tags/dto/updateTag.dto';

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

    it('/tags (PUT)', async () => {
        const id = '4f331bbc-f89e-4250-9709-bdc87548bfcf'; 
        const updateTagDto: UpdateTagDto = {
            name: 'UpdatedTagName', 
            active: true, 
        };

        const response = await request(app.getHttpServer())
            .put(`/tags?id=${id}`)
            .send(updateTagDto);

        expect(response.status).toBe(HttpStatus.OK); 
        expect(response.body).toHaveProperty('statusCode', HttpStatus.OK); 
    });
});
