import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { CourseService } from '../../../courses/course.service';
import { FirebaseService } from '../../../firebase/firebase.service';
import { AddSectionToCourseDto } from '../../../courses/dto/addSectionToCourse.dto';
import { AddSectionToCourseResponseDto } from '../../../courses/dto/addSectionToCourseResponse.dto';
import { NotFoundException } from '@nestjs/common';

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

    it('should add a section to a course', async () => {
        const courseId = '6e048ab8-3070-4f8b-a638-154f30b100c0'; 
        const sectionId = '5007e86e-54c3-43c0-b823-e4a14e41c75d'; 

        const addSectionToCourseDto: AddSectionToCourseDto = {
            courseId: courseId,
            sectionId: sectionId,
        };

        try {
            const response: AddSectionToCourseResponseDto = await courseService.addSectionToCourse(addSectionToCourseDto);

            expect(response).toBeDefined();
        } catch (error) {
            fail(error);
        }
    });

});
