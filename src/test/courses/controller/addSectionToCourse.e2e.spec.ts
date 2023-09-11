import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { AddSectionToCourseDto } from '../../../courses/dto/addSectionToCourse.dto';
import { AddSectionToCourseResponseDto } from '../../../courses/dto/addSectionToCourseResponse.dto';

describe('CoursesController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/assets/courses/sections (POST) - should add a section to a course', async () => {
        const addSectionToCourseDto: AddSectionToCourseDto = {
            courseId: '6e048ab8-3070-4f8b-a638-154f30b100c0', 
            sectionId: '5007e86e-54c3-43c0-b823-e4a14e41c75d', 
        };

        const response = await request(app.getHttpServer())
            .post('/assets/courses/sections')
            .send(addSectionToCourseDto)
            .expect(201);

        const responseBody: AddSectionToCourseResponseDto = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.statusCode).toBe(201);
    });

    afterAll(async () => {
        await app.close();
    });
});
