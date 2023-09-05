import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

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

    it('/tags (POST)', async () => {
        const createTagDto = {
            name: 'urgent', 
            username: 'user123', 
        };

        const response = await request(app.getHttpServer())
            .post('/tags')
            .send(createTagDto);

        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('statusCode', HttpStatus.CREATED);
        expect(response.body).toHaveProperty('description', 'The tag has been successfully created.');
    });
});
