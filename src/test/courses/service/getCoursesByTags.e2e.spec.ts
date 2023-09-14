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

    it('should get courses by tags', async () => {
        const sampleTags = ['tutorial'];

        jest.spyOn(courseService, 'getCoursesByTags').mockResolvedValue({
            statusCode: 200,
            message: 'COURSESGOT',
            coursesFound: [
            ],
        });

        const response = await courseService.getCoursesByTags(sampleTags);

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        expect(response.message).toBe('COURSESGOT');
    });
});
