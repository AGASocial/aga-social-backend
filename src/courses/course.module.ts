import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { CourseService } from './course.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, CourseService],
    exports: [CourseService]
})
export class CourseModule { }
