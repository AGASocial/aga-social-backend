import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { UpdateCourseDto } from '../../../courses/dto/updateCourse.dto';
import { UpdateCourseResponseDto } from '../../../courses/dto/updateCourseResponse.dto';

describe('CoursesController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/assets/courses (PUT) - should update a course', async () => {
        const courseId = '6e048ab8-3070-4f8b-a638-154f30b100c0'; 
        const updateCourseDto: UpdateCourseDto = {
            title: 'TITLE',
            description: 'DESCRIPTION',
            price: 59.99,
            offersCertificate: true,
            active: false,
        };

        const response = await request(app.getHttpServer())
            .put(`/assets/courses?id=${courseId}`)
            .send(updateCourseDto)
            .expect(200);

        expect(response.body.message).toBe('COURSEUPDATEDSUCCESSFULLY');
        expect(response.body.statusCode).toBe(201);

        const responseBody: UpdateCourseResponseDto = response.body;
        expect(responseBody.message).toBe('COURSEUPDATEDSUCCESSFULLY');
        expect(responseBody.statusCode).toBe(201);
    });

    afterAll(async () => {
        await app.close();
    });
});
