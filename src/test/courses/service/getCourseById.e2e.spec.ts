import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { CourseService } from '../../../courses/course.service';
import { FirebaseService } from '../../../firebase/firebase.service';
import { GetCoursesResponseDto } from '../../../courses/dto/getCoursesResponse.dto';

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

    it('should get a course by ID', async () => {
        const courseId = '05283b65-00ae-4aa0-9b38-02b043d574b8'; 

        try {
            const response: GetCoursesResponseDto = await courseService.getCourseById(courseId);

            expect(response).toBeDefined();
            expect(response.message).toBe('COURSESRETRIEVEDSUCCESSFULLY');
            expect(response.coursesFound).toHaveLength(1);
        } catch (error) {
            fail(error);
        }
    });

});
