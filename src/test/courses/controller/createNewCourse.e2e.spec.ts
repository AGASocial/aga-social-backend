import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { CreateCourseDto } from '../../../courses/dto/createCourse.dto';
import { CreateCourseResponseDto } from '../../../courses/dto/createCourseResponse.dto';

describe('CoursesController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/assets/courses (POST) - should create and upload a course', async () => {
        const createNewCourseDto: CreateCourseDto = {
            title: 'New Course',
            description: 'Description of the new course',
            publisher: 'Mary.123',
            price: 49.99,
            tags: ['Web Development', 'HTML', 'CSS'],
            releaseDate: new Date('2023-08-01'),
            instructorList: ['Instructor 1', 'Instructor 2'],
            language: 'English',
            offersCertificate: true,
            titlePage: 'https://example.com/course.jpg',
            salesCount: 0,
            sectionsIds: ['5007e86e-54c3-43c0-b823-e4a14e41c75d'],
        };

        const response = await request(app.getHttpServer())
            .post('/assets/courses')
            .send(createNewCourseDto)
            .expect(201);

        const createCourseResponse: CreateCourseResponseDto = response.body;
        expect(createCourseResponse).toBeDefined();
        expect(createCourseResponse.message).toBe('COURSECREATEDSUCCESSFULLY');
        expect(createCourseResponse.courseId).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
