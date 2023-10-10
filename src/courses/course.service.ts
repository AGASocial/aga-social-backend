import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, QueryFieldFilterConstraint, updateDoc, where } from "firebase/firestore";
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
import { StripeService } from "../Pluggins/stripe/stripe.service";
import { PurchaseCourseResponseDto } from "./dto/purchaseCourseResponse.dto";
import { DocResult } from "../utils/docResult.entity";


@Injectable()
export class CourseService {

    constructor(private firebaseService: FirebaseService, private stripeService: StripeService) { }



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





    @ApiOperation({ summary: 'Get all active courses' })
    @ApiOkResponse({ description: 'Active courses retrieved successfully', type: GetCoursesResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getCourses(): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCourses...');

            // If there is cached data and all courses are active, return cached data
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            if (cachedCourses.length > 0 && cachedCourses.every(course => course.active)) {
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
                if (data.active) {
                    queryResult.push({
                        id: data.id,
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
                        active: data.active,
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




    @ApiOkResponse({ description: 'Active courses retrieved successfully', type: GetCoursesResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({ type: GetCoursesResponseDto })
    async getCoursesByKeywords(keywords: string | string[]): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCoursesByKeywords...');

            if (!Array.isArray(keywords)) {
                keywords = [keywords];
            }

            console.log('Keywords:', keywords);

            // Tries to use data in cache if it exists
            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            if (cachedCourses.length > 0) {
                console.log('Using cached courses data.');

                const matchedCourses = cachedCourses.filter(course =>
                    course.active && this.courseMatchesKeywords(course, keywords)
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
            console.log('Courses query created.');

            const coursesQuerySnapshot = await getDocs(coursesRef);
            console.log('Courses query snapshot obtained.');

            const queryResult = [];
            coursesQuerySnapshot.forEach(doc => {
                const data = doc.data();
                queryResult.push({
                    id: data.id,
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
                    active: data.active,
                    titlePage: data.titlePage,
                });
            });
            console.log('Course data collected.');

            // Filter the courses by keywords
            const matchedCourses = queryResult.filter(course =>
                course.active && this.courseMatchesKeywords(course, keywords)
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

    private courseMatchesKeywords(course: Course, keywords: string[] | string): boolean {
        const lowerCaseTitle = course.title.toLowerCase();

        if (typeof keywords === 'string') {
            keywords = [keywords];
        }

        return keywords.every(keyword => {
            const keywordLowerCase = keyword.toLowerCase();
            console.log(`Checking keyword "${keywordLowerCase}" in title "${lowerCaseTitle}"`);
            return lowerCaseTitle.includes(keywordLowerCase);
        });
    }











    @ApiOperation({ summary: 'Get active courses by tags' })
    @ApiOkResponse({ description: 'Active courses retrieved successfully', type: GetCoursesResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({ type: GetCoursesResponseDto })
    async getCoursesByTags(tags: string[] | string): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCoursesByTags...');

            if (typeof tags === 'string') {
                tags = [tags];
            }

            // If there is no data in cache, query Firestore
            const coursesRef = this.firebaseService.coursesCollection;
            console.log('Courses query created.');

            const coursesQuerySnapshot = await getDocs(coursesRef);
            console.log('Courses query snapshot obtained.');

            const queryResult = [];
            coursesQuerySnapshot.forEach(doc => {
                const data = doc.data();
                queryResult.push({
                    id: data.id,
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
                    active: data.active,
                    titlePage: data.titlePage,
                });
            });
            console.log('Course data collected.');

            // Filter the courses by tags
            const matchedCourses = queryResult
                .filter(course => course.active) // Filter only active courses
                .filter(course => this.courseHasAnyTag(course, tags));

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


    private courseHasAnyTag(course: Course, tags: string[] | string): boolean {
        if (typeof tags === 'string') {
            tags = [tags];
        }

        return tags.some(tag => course.tags.includes(tag));
    }




    @ApiOperation({ summary: 'Add a section to a course' })
    @ApiCreatedResponse({ description: 'Section added to course successfully', type: AddSectionToCourseResponseDto })
    @ApiNotFoundResponse({ description: 'Course or section not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({ type: AddSectionToCourseDto })
    async addSectionToCourse(addSectionToCourseDto: AddSectionToCourseDto): Promise<AddSectionToCourseResponseDto> {
        try {
            const { courseId, sectionId } = addSectionToCourseDto;

            console.log(`Adding section with ID "${sectionId}" to course with ID "${courseId}"...`);

            // Find the section by ID
            const sectionCollectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuerySnapshot = await getDocs(query(sectionCollectionRef, where('id', '==', sectionId)));

            if (sectionQuerySnapshot.empty) {
                console.log(`Section with ID "${sectionId}" not found.`);
                throw new NotFoundException('SECTION_NOT_FOUND');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data() as Section;

            // Find the course by ID
            const courseCollectionRef = collection(this.firebaseService.fireStore, 'courses');
            const courseQuerySnapshot = await getDocs(query(courseCollectionRef, where('id', '==', courseId)));

            if (courseQuerySnapshot.empty) {
                console.log(`Course with ID "${courseId}" not found.`);
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
                if (course.id === courseId) {
                    return {
                        ...course,
                        sections: [...course.sections, newSection],
                    };
                }
                return course;
            });
            await this.firebaseService.setCollectionData('courses', updatedCachedCourses);

            console.log(`Section with ID "${sectionId}" added to course with ID "${courseId}" successfully.`);

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

            const { title, description, publisher, releaseDate, price, language, sectionsIds, tags, instructorList, offersCertificate, titlePage } = createNewCourseDto;
            const courseRef = collection(this.firebaseService.fireStore, 'courses');

            const newCourseId: string = uuidv4();
            const newSections = [];

            for (const sectionId of sectionsIds) {
                console.log('Checking if the section exists...');

                const sectionRef = collection(this.firebaseService.fireStore, 'sections');
                const sectionQuery = query(sectionRef, where('id', '==', sectionId));
                const sectionQuerySnapshot = await getDocs(sectionQuery);

                if (!sectionQuerySnapshot.empty) {
                    console.log('Section found for ID:', sectionId);
                    const sectionData = sectionQuerySnapshot.docs[0].data();
                    newSections.push(sectionData);
                } else {
                    console.log('Section not found for ID:', sectionId);
                    throw new BadRequestException('SECTION NOT FOUND: ' + sectionId);
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
                active: true,
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
                active: true,
                titlePage,
            });

            this.firebaseService.setCollectionData('courses', cachedCourses);
            console.log('Course added to the cache successfully.');

            console.log('Course created successfully.');
            const responseDto = new CreateCourseResponseDto(201, 'COURSECREATEDSUCCESSFULLY', newCourseId);
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }




    async purchaseCourse(userId: string, courseId: string, paymentIntentId: string): Promise<PurchaseCourseResponseDto> {
        try {
            const coursesCollectionRef = admin.firestore().collection('courses');
            const courseQuerySnapshot = await coursesCollectionRef.where('id', '==', courseId).get();

            if (courseQuerySnapshot.empty) {
                throw new Error('Course not found');
            }

            const courseDoc = courseQuerySnapshot.docs[0];
            const courseData = courseDoc.data();
            const coursePriceInCents = courseData.price * 100;

            const paymentConfirmed = await this.stripeService.confirmPayment(paymentIntentId);

            if (paymentConfirmed) {
                const userDoc = await admin.firestore().collection('users').doc(userId).get();
                const purchasedCourses = userDoc.data()?.purchasedCourses || [];

                const updatedPurchasedCourses = [...purchasedCourses, courseId];

                await admin.firestore().collection('users').doc(userId).update({
                    purchasedCourses: updatedPurchasedCourses,
                });

                const response = new PurchaseCourseResponseDto(201, 'COURSEPURCHASEDSUCCESSFULLY');
                return response;
            } else {
                const response = new PurchaseCourseResponseDto(400, 'Payment could not be completed');
                return response;
            }
        } catch (error) {
            console.error('Error purchasing course:', error);
            throw error;
        }
    }




    @ApiOperation({
        summary: 'Get purchased courses from an user',
        description: 'Fetches a list of courses that have been purchased by the specified user.',
    })
    @ApiOkResponse({
        description: 'Courses retrieved successfully',
        type: GetCoursesResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'No courses found for the user',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    async getPurchasedCourses(userId: string): Promise<GetCoursesResponseDto> {
        try {
            const usersRef = this.firebaseService.usersCollection;
            const usersQuery = query(usersRef, where('id', '==', userId));
            const usersQuerySnapshot = await getDocs(usersQuery);
            const userDoc = usersQuerySnapshot.docs[0];

            if (!userDoc.exists()) {
                return new GetCoursesResponseDto(404, 'USER_NOT_FOUND', []);
            }

            const userData = userDoc.data();

            if (!userData.purchasedCourses || userData.purchasedCourses.length === 0) {
                return new GetCoursesResponseDto(200, 'NO_COURSES_FOUND', []);
            }

            const purchasedCourseIds: string[] = userData.purchasedCourses;
            const purchasedCoursesDetails: Course[] = [];

            const coursesRef = this.firebaseService.coursesCollection;
            const coursesQuery = query(coursesRef, where('id', 'in', purchasedCourseIds));
            const coursesQuerySnapshot = await getDocs(coursesQuery);

            coursesQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                const courseDetails: Course = {
                    id: data.id,
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
                    active: data.active,
                    titlePage: data.titlePage,
                };
                purchasedCoursesDetails.push(courseDetails);
            });

            return new GetCoursesResponseDto(200, 'COURSES_RETRIEVED_SUCCESSFULLY', purchasedCoursesDetails);
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the purchased courses for the user.');
        }
    }










    private async copyFileToStorage(sourceFilePath: string, destinationFilePath: string): Promise<void> {
        const fileBucket = admin.storage().bucket();
        const sourceFile = fileBucket.file(sourceFilePath);
        const destinationFile = fileBucket.file(destinationFilePath);
        await sourceFile.copy(destinationFile);
        console.log('File copied successfully:', destinationFilePath);
    }



    @ApiOperation({ summary: 'Get course by ID' })
    @ApiOkResponse({ description: 'Course retrieved successfully', type: GetCoursesResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getCourseById(courseId: string): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCourseById...');

            const coursesRef = this.firebaseService.coursesCollection;
            const courseQuery = query(coursesRef, where('id', '==', courseId));
            const courseQuerySnapshot = await getDocs(courseQuery);

            if (courseQuerySnapshot.size > 0) {
                const courseDoc = courseQuerySnapshot.docs[0];
                const courseData = courseDoc.data();


                const publisher = courseData.publisher;

                const usersRef = this.firebaseService.usersCollection;
                const userQuery = query(usersRef, where('username', '==', publisher));
                const userQuerySnapshot = await getDocs(userQuery);

                let profilePicture = ''; 

                if (userQuerySnapshot.size > 0) {
                    const userDoc = userQuerySnapshot.docs[0];
                    const userData = userDoc.data();
                    profilePicture = userData.profilePicture;
                }



                const courseResult: DocResult = {
                    title: courseData.title,
                    description: courseData.description,
                    publisher: courseData.publisher,
                    price: courseData.price,
                    sections: courseData.sections,
                    tags: courseData.tags,
                    releaseDate: courseData.releaseDate,
                    instructorList: courseData.instructorList,
                    language: courseData.language,
                    offersCertificate: courseData.offersCertificate,
                    salesCount: courseData.salesCount,
                    active: courseData.active,
                    titlePage: courseData.titlePage,
                };

                const getCourseResponse: GetCoursesResponseDto = {
                    statusCode: 200,
                    message: 'COURSESRETRIEVEDSUCCESSFULLY',
                    userPicture: profilePicture,
                    coursesFound: [courseResult],
                };
                console.log('Response created.');
                return getCourseResponse;
            } else {
                throw new Error(`Course with ID ${courseId} not found.`);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the course.');
        }
    }


}