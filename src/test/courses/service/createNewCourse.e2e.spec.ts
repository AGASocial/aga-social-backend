import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { CourseService } from '../../../courses/course.service';
import { FirebaseService } from '../../../firebase/firebase.service';
import { CreateCourseDto } from '../../../courses/dto/createCourse.dto';
import { CreateCourseResponseDto } from '../../../courses/dto/createCourseResponse.dto';
import { BadRequestException } from '@nestjs/common';

describe('CourseService (e2e)', () => {
    let courseService: CourseService;
    let firebaseService: FirebaseService;
    let app;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [CourseService, FirebaseService],
        }).compile();

        courseService = moduleFixture.get<CourseService>(CourseService);
        firebaseService = moduleFixture.get<FirebaseService>(FirebaseService);
        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should be defined', () => {
        expect(courseService).toBeDefined();
    });

    it('should create and upload a course', async () => {
        const createNewCourseDto: CreateCourseDto = {
            title: 'New Course',
            description: 'Description of the new course',
            publisher: 'Mary.123',
            releaseDate: new Date(),
            price: 49.99,
            language: 'English',
            sectionsIds: ['5007e86e-54c3-43c0-b823-e4a14e41c75d'], 
            tags: ['Tag1', 'Tag2'],
            instructorList: ['Instructor1', 'Instructor2'],
            offersCertificate: true,
            titlePage: 'https://example.com/course.jpg',
            salesCount: 0
        };

        try {
            const response: CreateCourseResponseDto = await courseService.createAndUploadCourse(createNewCourseDto);

            expect(response).toBeDefined();
            expect(response.statusCode).toBe(201);
            expect(response.courseId).toBeDefined(); 
        } catch (error) {
            fail(error);
        }
    });

});
