import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { CourseService } from './course.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, CourseService],
    exports: [CourseService]
})
export class CourseModule { }
