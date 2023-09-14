import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { GetCoursesResponseDto } from '../../../courses/dto/getCoursesResponse.dto';

describe('CoursesController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/assets/courses (GET) - should get list of all courses', async () => {
        const response = await request(app.getHttpServer())
            .get('/assets/courses')
            .expect(200);

        const responseBody: GetCoursesResponseDto = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.statusCode).toBe(200);
    });

    it('/assets/courses (GET) - should get list of courses by keywords', async () => {
        const keywords = ['cursito'];
        const response = await request(app.getHttpServer())
            .get(`/assets/courses?keywords=${keywords.join(',')}`)
            .expect(200);

        const responseBody: GetCoursesResponseDto = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.statusCode).toBe(200);
        expect(responseBody.message).toBe('COURSESRETRIEVEDSUCCESSFULLY');
    });

    it('/assets/courses (GET) - should get list of courses by tags', async () => {
        const tags = ['tutorial'];
        const response = await request(app.getHttpServer())
            .get(`/assets/courses?tags=${tags.join(',')}`)
            .expect(200);

        const responseBody: GetCoursesResponseDto = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.statusCode).toBe(200);
        expect(responseBody.message).toBe('COURSESRETRIEVEDSUCCESSFULLY');
        expect(responseBody.coursesFound).toBeInstanceOf(Array);
        expect(responseBody.coursesFound.length).toBeGreaterThan(0);
    });

    it('/assets/courses (GET) - should get a course by ID', async () => {
        const courseId = '05283b65-00ae-4aa0-9b38-02b043d574b8';

        const response = await request(app.getHttpServer())
            .get(`/assets/courses?id=${courseId}`)
            .expect(200);

        const responseBody: GetCoursesResponseDto = response.body;
        expect(responseBody).toBeDefined();
        expect(responseBody.statusCode).toBe(200);
    });


    afterAll(async () => {
        await app.close();
    });
});
