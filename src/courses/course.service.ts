import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { addDoc, collection, deleteDoc, getDocs, orderBy, query, QueryFieldFilterConstraint, updateDoc, where } from "firebase/firestore";
import { FirebaseService } from "../firebase/firebase.service";
import { CreateCourseDto } from "./dto/createCourse.dto";
import { CreateCourseResponseDto } from "./dto/createCourseResponse.dto";
import { UpdateCourseDto } from "./dto/updateCourse.dto";
import { UpdateCourseResponseDto } from "./dto/updateCourseResponse.dto";
import { Course } from "./entities/course.entity";
import * as admin from 'firebase-admin';
import { DeleteCourseResponseDto } from "./dto/deleteCourseResponse.dto";
import { GetCoursesResponseDto } from "./dto/getCoursesResponse.dto";
import { Section } from "../sections/entities/sections.entity";
import { AddSectionToCourseDto } from "./dto/addSectionToCourse.dto";
import { AddSectionToCourseResponseDto } from "./dto/addSectionToCourseResponse.dto";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class CourseService {

    constructor(private firebaseService: FirebaseService) { }



    @ApiOperation({ summary: 'Create a new course' })
    @ApiOkResponse({ description: 'Course created successfully', type: CreateCourseResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async createNewCourse(createNewCourseDto: CreateCourseDto): Promise<CreateCourseResponseDto> {
        try {
            console.log('Creating a new course...');

            const { title, description, publisher, releaseDate, price, language, tags, instructorList, offersCertificate, titlePage, sectionsNames } = createNewCourseDto;
            const courseRef = collection(this.firebaseService.fireStore, 'courses');

            console.log('Checking if course with title already exists...');
            const customCourseWhere: QueryFieldFilterConstraint = where('title', '==', title);
            const courseQuery = query(courseRef, customCourseWhere);
            const courseQuerySnapshot = await getDocs(courseQuery);

            if (!courseQuerySnapshot.empty) {
                console.log('Course with that title already exists.');
                throw new BadRequestException('COURSE WITH THAT TITLE ALREADY EXISTS');
            }

            console.log('Checking if publisher exists...');
            const userRef = collection(this.firebaseService.fireStore, 'users');
            const userQuery = query(userRef, where('username', '==', publisher));
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                console.log('Publisher with that username does not exist.');
                throw new BadRequestException('PUBLISHER NOT FOUND: ' + publisher);
            }

            const newCourseId: string = uuidv4();
            const newSections = [];

            for (const sectionName of sectionsNames) {
                console.log('Checking if the section exists...');

                const sectionRef = collection(this.firebaseService.fireStore, 'sections');
                const sectionQuery = query(sectionRef, where('name', '==', sectionName));
                const sectionQuerySnapshot = await getDocs(sectionQuery);

                if (!sectionQuerySnapshot.empty) {
                    console.log('Section found for name:', sectionName);
                    const sectionData = sectionQuerySnapshot.docs[0].data();
                    newSections.push(sectionData);
                } else {
                    console.log('Section not found for name:', sectionName);
                    throw new BadRequestException('NAME NOT FOUND in REGISTERED SECTIONS: ' + sectionName);
                }
            }

            const newCourse: Course = {
                id: newCourseId,
                title: title,
                description: description,
                publisher: publisher,
                releaseDate: releaseDate,
                price: price,
                language: language,
                sections: newSections,
                tags: tags,
                instructorList: instructorList,
                offersCertificate: offersCertificate,
                salesCount: 0,
                isActive: true,
                titlePage: titlePage,
            };

            console.log('Creating new course...');
            const newCourseDocRef = await addDoc(courseRef, newCourse);

            //Adds the created course to the cache
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            cachedCourses.push({
                id: newCourseId,
                title,
                description,
                publisher,
                price,
                sections: newSections, 
                tags,
                releaseDate,
                instructorList,
                language,
                offersCertificate,
                salesCount: 0,
                isActive: true,
                titlePage,
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







    @ApiOperation({ summary: 'Update a course' })
    @ApiOkResponse({ description: 'Course updated successfully', type: UpdateCourseResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiNotFoundResponse({ description: 'Course not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async updateCourse(id: string, newData: Partial<UpdateCourseDto>): Promise<UpdateCourseResponseDto> {
        try {
            console.log('Initializing updateCourses...');
            const coursesCollectionRef = admin.firestore().collection('courses');

            const querySnapshot = await coursesCollectionRef.where('id', '==', id).get();

            if (querySnapshot.empty) {
                console.log(`The course with the id "${id}" does not exist.`);
                throw new Error('IDDOESNOTEXIST.');
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
            const updatedCourseIndex = cachedCourses.findIndex((course) => course.id === id);
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



    /*
    //NOT IN USE
    @ApiOperation({ summary: 'Delete a course' })
    @ApiOkResponse({ description: 'Course deleted successfully', type: DeleteCourseResponseDto })
    @ApiNotFoundResponse({ description: 'Course not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
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
    }*/






    @ApiOperation({ summary: 'Get all active courses' })
    @ApiOkResponse({ description: 'Active courses retrieved successfully', type: GetCoursesResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getCourses(): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCourses...');

            // If there is cached data and all courses are active, return cached data
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            if (cachedCourses.length > 0 && cachedCourses.every(course => course.isActive)) {
                console.log('Using cached courses data.');
                const getCoursesDtoResponse: GetCoursesResponseDto = {
                    statusCode: 200,
                    message: 'COURSESGOT',
                    coursesFound: cachedCourses,
                };
                return getCoursesDtoResponse;
            }

            // If there is no data or some courses are inactive, use Firestore
            const coursesRef = this.firebaseService.coursesCollection;
            const coursesQuery = query(coursesRef, orderBy('title'));
            console.log('Courses query created.');

            const coursesQuerySnapshot = await getDocs(coursesQuery);
            console.log('Courses query snapshot obtained.');

            let queryResult = [];
            coursesQuerySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.isActive) {
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
                        salesCount: data.salesCount,
                        isActive: data.isActive,
                        titlePage: data.titlePage,
                    });
                }
            });
            console.log('Courses data collected.');

            // Save the active courses data in cache for future queries
            this.firebaseService.setCollectionData('courses', queryResult);

            const getCoursesDtoResponse: GetCoursesResponseDto = {
                statusCode: 200,
                message: 'COURSESGOT',
                coursesFound: queryResult,
            };
            console.log('Response created.');

            return getCoursesDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the courses.');
        }
    }





    @ApiOperation({ summary: 'Get active courses by keywords' })
    @ApiOkResponse({ description: 'Active courses retrieved successfully', type: GetCoursesResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({ type: GetCoursesResponseDto })
    async getCoursesByKeywords(keywords: string[]): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCoursesByKeywords...');

            // Tries to use data in cache if it exists
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            if (cachedCourses.length > 0) {
                console.log('Using cached courses data.');
                const matchedCourses = cachedCourses
                    .filter(course => course.isActive) // Filter only active courses
                    .filter(course =>
                        keywords.some(keyword => course.title.toLowerCase().includes(keyword.toLowerCase()))
                    );

                const responseDto: GetCoursesResponseDto = {
                    statusCode: 200,
                    message: 'COURSESGOT',
                    coursesFound: matchedCourses,
                };
                return responseDto;
            }

            // If there is no data in cache, query Firestore
            const coursesRef = this.firebaseService.coursesCollection;
            const coursesQuery = query(coursesRef, orderBy('title'));
            console.log('Courses query created.');

            const coursesQuerySnapshot = await getDocs(coursesQuery);
            console.log('Courses query snapshot obtained.');

            const queryResult = [];
            coursesQuerySnapshot.forEach(doc => {
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
                    salesCount: data.salesCount,
                    isActive: data.isActive,
                    titlePage: data.titlePage,

                });
            });
            console.log('Course data collected.');

            // Filter the courses by keywords
            const matchedCourses = queryResult
                .filter(course => course.isActive) // Filter only active courses
                .filter(course =>
                    keywords.some(keyword => course.title.toLowerCase().includes(keyword.toLowerCase()))
                );

            // Save the active courses data in cache for future queries
            await this.firebaseService.setCollectionData('courses', queryResult);

            const responseDto: GetCoursesResponseDto = {
                statusCode: 200,
                message: 'COURSESGOT',
                coursesFound: matchedCourses,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the courses.');
        }
    }



    @ApiOperation({ summary: 'Get active courses by tags' })
    @ApiOkResponse({ description: 'Active courses retrieved successfully', type: GetCoursesResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({ type: GetCoursesResponseDto })
    async getCoursesByTags(tags: string[]): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCoursesByTags...');

            // Tries to use data in cache if it exists
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            if (cachedCourses.length > 0) {
                console.log('Using cached courses data.');
                const matchedCourses = cachedCourses
                    .filter(course => course.isActive) // Filter only active courses
                    .filter(course =>
                        tags.some(tag => course.tags.includes(tag))
                    );

                const responseDto: GetCoursesResponseDto = {
                    statusCode: 200,
                    message: 'COURSESGOT',
                    coursesFound: matchedCourses,
                };
                return responseDto;
            }

            // If there is no data in cache, query Firestore
            const coursesRef = this.firebaseService.coursesCollection;
            const coursesQuery = query(coursesRef, orderBy('title'));
            console.log('Courses query created.');

            const coursesQuerySnapshot = await getDocs(coursesQuery);
            console.log('Courses query snapshot obtained.');

            const queryResult = [];
            coursesQuerySnapshot.forEach(doc => {
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
                    salesCount: data.salesCount,
                    isActive: data.isActive,
                    titlePage: data.titlePage,

                });
            });
            console.log('Course data collected.');

            // Filter the courses by tags
            const matchedCourses = queryResult
                .filter(course => course.isActive) // Filter only active courses
                .filter(course =>
                    tags.some(tag => course.tags.includes(tag))
                );

            // Save the active courses data in cache for future queries
            await this.firebaseService.setCollectionData('courses', queryResult);

            const responseDto: GetCoursesResponseDto = {
                statusCode: 200,
                message: 'COURSESGOT',
                coursesFound: matchedCourses,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the courses.');
        }
    }



    @ApiOperation({ summary: 'Add a section to a course' })
    @ApiCreatedResponse({ description: 'Section added to course successfully', type: AddSectionToCourseResponseDto })
    @ApiNotFoundResponse({ description: 'Course or section not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({ type: AddSectionToCourseDto })
    async addSectionToCourse(addSectionToCourseDto: AddSectionToCourseDto): Promise<AddSectionToCourseResponseDto> {
        try {
            const { courseName, sectionName } = addSectionToCourseDto;

            console.log(`Adding section "${sectionName}" to course "${courseName}"...`);

            // Find the section by name
            const sectionCollectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuerySnapshot = await getDocs(query(sectionCollectionRef, where('name', '==', sectionName)));

            if (sectionQuerySnapshot.empty) {
                console.log(`Section "${sectionName}" not found.`);
                throw new NotFoundException('SECTION_NOT_FOUND');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data() as Section;

            // Find the course by name
            const courseCollectionRef = collection(this.firebaseService.fireStore, 'courses');
            const courseQuerySnapshot = await getDocs(query(courseCollectionRef, where('title', '==', courseName)));

            if (courseQuerySnapshot.empty) {
                console.log(`Course "${courseName}" not found.`);
                throw new NotFoundException('COURSE_NOT_FOUND');
            }

            const courseDoc = courseQuerySnapshot.docs[0];
            const courseData = courseDoc.data() as Course;

            // Create a new section using section data
            const newSection: Section = {
                name: sectionData.name,
                description: sectionData.description,
                tags: sectionData.tags,
                content: sectionData.content || [], // Initialize content from the section or as an empty array
            };

            // Add the new section to the course's content
            courseData.sections.push(newSection);

            // Update the course in the database
            await updateDoc(courseDoc.ref, { content: courseData.sections });

            // Update cached courses data
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            const updatedCachedCourses = cachedCourses.map(course => {
                if (course.title === courseName) {
                    return {
                        ...course,
                        sections: [...course.sections, newSection],
                    };
                }
                return course;
            });
            await this.firebaseService.setCollectionData('courses', updatedCachedCourses);

            console.log(`Section "${sectionName}" added to course "${courseName}" successfully.`);

            const responseDto: AddSectionToCourseResponseDto = {
                statusCode: 201,
                message: 'SECTION_ADDED_TO_COURSE_SUCCESSFULLY',
            };

            return responseDto;
        } catch (error) {
            console.error('Error adding section to course:', error);
            throw error;
        }
    }





    async createAndUploadCourse(createNewCourseDto: CreateCourseDto): Promise<CreateCourseResponseDto> {
        try {
            console.log('Creating a new course...');

            const { title, description, publisher, releaseDate, price, language, sectionsNames, tags, instructorList, offersCertificate, titlePage } = createNewCourseDto;
            const courseRef = collection(this.firebaseService.fireStore, 'courses');

            const customCourseWhere: QueryFieldFilterConstraint = where('title', '==', title);
            const courseQuery = query(courseRef, customCourseWhere);
            const courseQuerySnapshot = await getDocs(courseQuery);

            if (!courseQuerySnapshot.empty) {
                throw new BadRequestException('COURSE WITH THAT TITLE ALREADY EXISTS');
            }

            const newCourseId: string = uuidv4();
            const newSections = [];

            for (const sectionName of sectionsNames) {
                console.log('Checking if the section exists...');

                const sectionRef = collection(this.firebaseService.fireStore, 'sections');
                const sectionQuery = query(sectionRef, where('name', '==', sectionName));
                const sectionQuerySnapshot = await getDocs(sectionQuery);

                if (!sectionQuerySnapshot.empty) {
                    console.log('Section found for name:', sectionName);
                    const sectionData = sectionQuerySnapshot.docs[0].data();
                    newSections.push(sectionData);
                } else {
                    console.log('Section not found for name:', sectionName);
                    throw new BadRequestException('NAME NOT FOUND in REGISTERED SECTIONS: ' + sectionName);
                }
            }

            for (const section of newSections) {
                if (section.content && section.content.length > 0) {
                    for (const contentItem of section.content) {
                        const url = contentItem.url;
                        const fileName = url.split('/').pop();
                        const sourceFilePath = url;
                        const destinationFilePath = `assets/${newCourseId}/${section.id}/${fileName}`;
                        await this.copyFileToStorage(sourceFilePath, destinationFilePath);
                    }
                }

                if (section.subsections && section.subsections.length > 0) {
                    for (const subsection of section.subsections) {
                        if (subsection.content && subsection.content.length > 0) {
                            for (const contentItem of subsection.content) {
                                const url = contentItem.url;
                                const fileName = url.split('/').pop();
                                const sourceFilePath = url;
                                const destinationFilePath = `assets/${newCourseId}/${section.id}/${subsection.id}/${fileName}`;
                                await this.copyFileToStorage(sourceFilePath, destinationFilePath);
                            }
                        }
                    }
                }
            }

            const userRef = collection(this.firebaseService.fireStore, 'users');
            const userQuery = query(userRef, where('username', '==', publisher));
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                throw new BadRequestException('PUBLISHER NOT FOUND: ' + publisher);
            }

            const newCourse: Course = {
                id: newCourseId,
                title: title,
                description: description,
                publisher: publisher,
                releaseDate: releaseDate,
                price: price,
                language: language,
                sections: newSections,
                tags: tags,
                instructorList: instructorList,
                offersCertificate: offersCertificate,
                salesCount: 0,
                isActive: true,
                titlePage: titlePage,
            };

            console.log('Creating new course...');
            const newCourseDocRef = await addDoc(courseRef, newCourse);

            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            cachedCourses.push({
                id: newCourseId,
                title,
                description,
                publisher,
                price,
                sections: newSections,
                tags,
                releaseDate,
                instructorList,
                language,
                offersCertificate,
                salesCount: 0,
                isActive: true,
                titlePage,
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














    private async copyFileToStorage(sourceFilePath: string, destinationFilePath: string): Promise<void> {
        const fileBucket = admin.storage().bucket();
        const sourceFile = fileBucket.file(sourceFilePath);
        const destinationFile = fileBucket.file(destinationFilePath);
        await sourceFile.copy(destinationFile);
        console.log('File copied successfully:', destinationFilePath);
    }





}