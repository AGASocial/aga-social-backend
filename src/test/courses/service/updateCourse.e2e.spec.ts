import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { CourseService } from '../../../courses/course.service';
import { FirebaseService } from '../../../firebase/firebase.service';
import { UpdateCourseDto } from '../../../courses/dto/updateCourse.dto';


describe('CourseService (e2e)', () => {
    let courseService: CourseService;
    let firestoreService: FirebaseService;
    let app;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [CourseService, FirebaseService],
        }).compile();

        courseService = moduleFixture.get<CourseService>(CourseService);
        firestoreService = moduleFixture.get<FirebaseService>(FirebaseService);
        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should be defined', () => {
        expect(courseService).toBeDefined();
    });

    it('should update a course', async () => {
        const courseId = '05283b65-00ae-4aa0-9b38-02b043d574b8';
        const updateData: UpdateCourseDto = {
            title: 'New Title',
        };

        const response = await courseService.updateCourse(courseId, updateData);

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);

    });
});
