import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { addDoc, collection, deleteDoc, getDocs, orderBy, query, QueryFieldFilterConstraint, where } from "firebase/firestore";
import { FirebaseService } from "../firebase/firebase.service";
import { CreateCourseDto } from "./dto/createCourse.dto";
import { CreateCourseResponseDto } from "./dto/createCourseResponse.dto";
import { UpdateCourseDto } from "./dto/updateCourse.dto";
import { UpdateCourseResponseDto } from "./dto/updateCourseResponse.dto";
import { Course } from "./entities/course.entity";
import * as admin from 'firebase-admin';
import { DeleteCourseResponseDto } from "./dto/deleteCourseResponse.dto";
import { GetCoursesResponseDto } from "./dto/getCoursesResponse.dto";


@Injectable()
export class CourseService {

    constructor(private firebaseService: FirebaseService) { }

    async createNewCourse(createNewCourseDto: CreateCourseDto): Promise<CreateCourseResponseDto> {
        try {
            console.log('Creating a new course...');

            const { title, description, publisher, releaseDate, price, language, sections, tags, instructorList, offersCertificate } = createNewCourseDto;
            const courseRef = collection(this.firebaseService.fireStore, 'courses');

            console.log('Checking if course with title already exists...');
            const customCourseWhere: QueryFieldFilterConstraint = where('title', '==', title);
            const courseQuery = query(courseRef, customCourseWhere);
            const courseQuerySnapshot = await getDocs(courseQuery);

            if (!courseQuerySnapshot.empty) {
                console.log('Course with that title already exists.');
                throw new BadRequestException('COURSE WITH THAT TITLE ALREADY EXISTS');
            }

            for (const item of sections) {
                console.log('Checking if the sections exist...');

                const sectionRef = collection(this.firebaseService.fireStore, 'sections');
                const sectionQuery = query(sectionRef, where('name', '==', item.name));
                const sectionQuerySnapshot = await getDocs(sectionQuery);

                if (!sectionQuerySnapshot.empty) {
                    console.log('Section found for name:', item.name);
                    continue; // Skip to the next item in content
                }

                console.log('Section not found for name:', item.name);
                throw new BadRequestException('NAME NOT FOUND in REGISTERED SECTIONS: ' + item.name);
            }


            const newCourse: Course = {
                title: title,
                description: description,
                publisher: publisher,
                releaseDate: releaseDate,
                price: price,
                language: language,
                sections: sections,
                tags: tags,
                instructorList: instructorList,
                offersCertificate: offersCertificate,
            };

            console.log('Creating new course...');
            const newCourseDocRef = await addDoc(courseRef, newCourse);
            const newCourseId = newCourseDocRef.id;

            //Adds the created course to the cache
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            cachedCourses.push({
                title,
                description,
                publisher,
                price,
                sections,
                tags,
                releaseDate,
                instructorList,
                language,
                offersCertificate,
            });
            this.firebaseService.setCollectionData('courses', cachedCourses);
            console.log('Course added to the cache successfully.');



            console.log('Course created successfully.');
            const responseDto = new CreateCourseResponseDto(201, 'COURSECREATEDSUCCESSFULLY');
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            throw error;

        }
    }


    async updateCourse(title: string, newData: Partial<UpdateCourseDto>): Promise<UpdateCourseResponseDto> {
        try {
            console.log('Initializing updateCourses...');
            const coursesCollectionRef = admin.firestore().collection('courses');

            const querySnapshot = await coursesCollectionRef.where('title', '==', title).get();

            if (querySnapshot.empty) {
                console.log(`The course with the title "${title}" does not exist.`);
                throw new Error('TITLEDOESNOTEXIST.');
            }

            const coursesDoc = querySnapshot.docs[0];

            const courseData = coursesDoc.data() as Course;

            // Update the course data
            const updatedData = { ...courseData, ...newData };

            // Update in Firestore
            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, updatedData);
            });

            await batch.commit();

            // Update the cache
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            const updatedCourseIndex = cachedCourses.findIndex((course) => course.title === title);
            if (updatedCourseIndex !== -1) {
                cachedCourses[updatedCourseIndex] = { ...cachedCourses[updatedCourseIndex], ...newData };
                this.firebaseService.setCollectionData('courses', cachedCourses);
            }

            const response: UpdateCourseResponseDto = {
                statusCode: 200,
                message: 'COURSEUPDATEDSUCCESSFULLY',
            };

            return response;
        } catch (error) {
            console.error('There was an error updating the course data:', error);
            throw error;
        }
    }


    async deleteCourse(title: string): Promise<DeleteCourseResponseDto> {
        try {
            const courseCollectionRef = collection(this.firebaseService.fireStore, 'courses');
            const courseQuerySnapshot = await getDocs(query(courseCollectionRef, where('title', '==', title)));

            if (courseQuerySnapshot.empty) {
                console.log(`Course with title "${title}" not found in the courses collection.`);
                throw new NotFoundException('COURSESNOTFOUND');
            }
            const coursesDoc = courseQuerySnapshot.docs[0];

            // Delete from Firestore
            await deleteDoc(coursesDoc.ref);

            // Update the cache
            
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            const indexToDelete = cachedCourses.findIndex((course) => course.title === title);

            if (indexToDelete !== -1) {
                cachedCourses.splice(indexToDelete, 1);
                this.firebaseService.setCollectionData('courses', cachedCourses);
            }


            const response: DeleteCourseResponseDto = {
                statusCode: 200,
                message: 'COURSEDELETEDSUCCESSFULLY',
            };

            console.log(`The course has been deleted successfully.`);
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }


    async getCourses(): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCourses...');

            // Tries to use data in cache if it exists
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            if (cachedCourses.length > 0) {
                console.log('Using cached courses data.');
                const getCoursesDtoResponse: GetCoursesResponseDto = {
                    statusCode: 200,
                    message: "COURSESGOT",
                    coursesFound: cachedCourses,
                };
                return getCoursesDtoResponse;
            }

            // If there is no data, it uses firestore instead
            const coursesRef = this.firebaseService.coursesCollection;
            const coursesQuery = query(coursesRef, orderBy("title"));
            console.log('Courses query created.');

            const coursesQuerySnapshot = await getDocs(coursesQuery);
            console.log('Courses query snapshot obtained.');

            let queryResult = [];
            coursesQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    title: data.title,
                    description: data.description,
                    publisher: data.publisher,
                    price: data.price,
                    sections: data.sections,
                    tags: data.tags,
                    releaseDate: data.releaseDate,
                    instructorList: data.instructorList,
                    language: data.language,
                    offersCertificate: data.offersCertificate,
                });
            });
            console.log('Courses data collected.');

            // the data is saved in cache for future queries
            this.firebaseService.setCollectionData('courses', queryResult);

            const getCoursesDtoResponse: GetCoursesResponseDto = {
                statusCode: 200,
                message: "COURSESGOT",
                coursesFound: queryResult,
            };
            console.log('Response created.');

            return getCoursesDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the courses.');
        }
    }



}