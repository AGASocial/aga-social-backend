import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, QueryFieldFilterConstraint, updateDoc, where } from "firebase/firestore";
import { FirebaseService } from "../firebase/firebase.service";
import { CreateCourseDto } from "./dto/createCourse.dto";
import { CreateCourseResponseDto } from "./dto/createCourseResponse.dto";
import { UpdateCourseDto } from "./dto/updateCourse.dto";
import { UpdateCourseResponseDto } from "./dto/updateCourseResponse.dto";
import { Course } from "./entities/course.entity";
import * as admin from 'firebase-admin';
import { GetCoursesResponseDto } from "./dto/getCoursesResponse.dto";
import { Section } from "../sections/entities/sections.entity";
import { AddSectionToCourseResponseDto } from "./dto/addSectionToCourseResponse.dto";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { v4 as uuidv4 } from 'uuid';
import { StripeService } from "../Pluggins/stripe/stripe.service";
import { PurchaseCourseResponseDto } from "./dto/purchaseCourseResponse.dto";
import { DocResult } from "../utils/docResult.entity";


@Injectable()
export class CourseService {

    constructor(private firebaseService: FirebaseService, private stripeService: StripeService) { }



  
    async updateCourse(id: string, newData: Partial<UpdateCourseDto>): Promise<UpdateCourseResponseDto> {
        try {
            console.log('Initializing updateCourses...');
            const coursesCollectionRef = admin.firestore().collection('courses');

            const querySnapshot = await coursesCollectionRef.where('id', '==', id).get();

            if (querySnapshot.empty) {
                console.log(`The course with the id "${id}" does not exist.`);
                return new UpdateCourseResponseDto('error', 404, 'Course not found', {});
            }

            const coursesDoc = querySnapshot.docs[0];
            const courseData = coursesDoc.data() as Course;

            const updatedData = { ...courseData, ...newData };

            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, updatedData);
            });

            await batch.commit();

            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            const updatedCourseIndex = cachedCourses.findIndex((course) => course.id === id);

            if (updatedCourseIndex !== -1) {
                cachedCourses[updatedCourseIndex] = { ...cachedCourses[updatedCourseIndex], ...newData };
                this.firebaseService.setCollectionData('courses', cachedCourses);
            }

            return new UpdateCourseResponseDto('success', 200, 'The course was updated successfully', {});
        } catch (error) {
            console.error('There was an error updating the course data:', error);
            return new UpdateCourseResponseDto('error', 400, 'The course could not be updated, please, try again.', {});
        }
    }




  
    async getCourses(): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCourses...');

            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            if (cachedCourses.length > 0 && cachedCourses.every(course => course.active)) {
                console.log('Using cached courses data.');
                return new GetCoursesResponseDto('success', 200, 'The courses were retrieved successfully', cachedCourses);
            }

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

            this.firebaseService.setCollectionData('courses', queryResult);

            console.log('Response created.');
            if (queryResult.length === 0) {
                return new GetCoursesResponseDto('error', 404, 'No courses were found.', {});
            }

            return new GetCoursesResponseDto('success', 200, 'The courses were retrieved successfully', queryResult);
        } catch (error) {
            console.error('An error occurred:', error);
            return new GetCoursesResponseDto('error', 400, 'The courses could not be retrieved.', {});
        }
    }


 
    async getCoursesByKeywords(keywords: string | string[]): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCoursesByKeywords...');

            if (!Array.isArray(keywords)) {
                keywords = [keywords];
            }

            console.log('Keywords:', keywords);

            const cachedCourses = await this.firebaseService.getCollectionData('courses');
            if (cachedCourses.length > 0) {
                console.log('Using cached courses data.');

                const matchedCourses = cachedCourses.filter(course =>
                    course.active && this.courseMatchesKeywords(course, keywords)
                );

                if (matchedCourses.length === 0) {
                    const responseDto: GetCoursesResponseDto = {
                        status: 'error',
                        code: 404,
                        message: 'No courses found for the given keywords',
                        data: {
                            result: {},
                        },
                    };
                    return responseDto;
                }

                const responseDto: GetCoursesResponseDto = {
                    status: 'success',
                    code: 200,
                    message: 'Courses retrieved successfully',
                    data: {
                        result: matchedCourses,
                    },
                };
                return responseDto;
            }

            const coursesRef = this.firebaseService.coursesCollection;

            const coursesQuerySnapshot = await getDocs(coursesRef);

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

            const matchedCourses = queryResult.filter(course =>
                course.active && this.courseMatchesKeywords(course, keywords)
            );

            await this.firebaseService.setCollectionData('courses', queryResult);

            const responseDto: GetCoursesResponseDto = {
                status: 'success',
                code: 200,
                message: 'Courses retrieved successfully',
                data: {
                    result: matchedCourses,
                },
            };

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            const responseDto: GetCoursesResponseDto = {
                status: 'error',
                code: 400,
                message: 'Courses could not be retrieved',
                data: {
                    result: {},
                },
            };

            return responseDto;
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








    async getCoursesByTags(tags: string[] | string): Promise<GetCoursesResponseDto> {
        try {
            console.log('Initializing getCoursesByTags...');

            if (typeof tags === 'string') {
                tags = [tags];
            }

            const coursesRef = this.firebaseService.coursesCollection;
            console.log('Courses query created.');

            const coursesQuerySnapshot = await getDocs(coursesRef);

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

            const matchedCourses = queryResult
                .filter(course => course.active)
                .filter(course => this.courseHasAnyTag(course, tags));

            if (matchedCourses.length === 0) {
                const responseDto: GetCoursesResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'No courses found for the given tags.',
                    data: {
                        result: {},
                    },
                };
                return responseDto;
            }

            const responseDto: GetCoursesResponseDto = {
                status: 'success',
                code: 200,
                message: 'Courses retrieved successfully.',
                data: {
                    result: matchedCourses,
                },
            };

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            const responseDto: GetCoursesResponseDto = {
                status: 'error',
                code: 400,
                message: 'Courses could not be retrieved.',
                data: {
                    result: {},
                },
            };

            return responseDto;
        }
    }




    private courseHasAnyTag(course: Course, tags: string[] | string): boolean {
        if (typeof tags === 'string') {
            tags = [tags];
        }

        return tags.some(tag => course.tags.includes(tag));
    }




    async addSectionToCourse(courseId: string, sectionId: string): Promise<AddSectionToCourseResponseDto> {
        try {

            console.log(`Adding section with ID "${sectionId}" to course with ID "${courseId}"...`);

            const sectionCollectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuerySnapshot = await getDocs(query(sectionCollectionRef, where('id', '==', sectionId)));

            if (sectionQuerySnapshot.empty) {
                console.log(`Section with ID "${sectionId}" not found.`);
                const responseDto: AddSectionToCourseResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Section with given ID not found.',
                    data: {
                        result: {}
                    }
                };

                return responseDto;
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data() as Section;

            const courseCollectionRef = collection(this.firebaseService.fireStore, 'courses');
            const courseQuerySnapshot = await getDocs(query(courseCollectionRef, where('id', '==', courseId)));

            if (courseQuerySnapshot.empty) {
                console.log(`Course with ID "${courseId}" not found.`);
                const responseDto: AddSectionToCourseResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Course with given ID not found.',
                    data: {
                        result: {}
                    }
                };

                return responseDto;
            }

            const courseDoc = courseQuerySnapshot.docs[0];
            const courseData = courseDoc.data() as Course;

            const newSection: Section = {
                name: sectionData.name,
                description: sectionData.description,
                tags: sectionData.tags,
                content: sectionData.content || [],
            };

            courseData.sections.push(newSection);

            await updateDoc(courseDoc.ref, { content: courseData.sections });

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
                status: 'success',
                code: 201,
                message: 'Section added to course successfully',
                data: {
                    result: { courseId, sectionId }
                }
            };

            return responseDto;
        } catch (error) {
            console.error('Error adding section to course:', error);
            const responseDto: AddSectionToCourseResponseDto = {
                status: 'error',
                code: 400,
                message: 'Section could not be added to course.',
                data: {
                    result: {}
                }
            };

            return responseDto;
        }
    }







    async createAndUploadCourse(createNewCourseDto: CreateCourseDto): Promise<CreateCourseResponseDto> {
        try {
            console.log('Creating a new course...');

            const { title, description, publisher, releaseDate, price, language, sectionsIds, tags, instructorList, offersCertificate, titlePage } = createNewCourseDto;
            const courseRef = collection(this.firebaseService.fireStore, 'courses');

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
                    const responseDto: CreateCourseResponseDto = {
                        status: 'error',
                        code: 404,
                        message: 'Section not found.',
                        data: {
                            result: {}
                        }
                    };
                    return responseDto;
                }
            }

            const userRef = collection(this.firebaseService.fireStore, 'users');
            const userQuery = query(userRef, where('username', '==', publisher));
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                const responseDto: CreateCourseResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Publisher not found. The publisher must be the username of the creator.',
                    data: {
                        result: {}
                    }
                };
                return responseDto;
            }

            const newCourse: Course = {
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
            const newCourseId = newCourseDocRef.id;

            await updateDoc(newCourseDocRef, { id: newCourseId });

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
            const responseDto: CreateCourseResponseDto = {
                status: 'success',
                code: 201,
                message: 'The course was created successfully.',
                data: {
                    result: { courseId: newCourseId }
                }
            };
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            const responseDto: CreateCourseResponseDto = {
                status: 'error',
                code: 400,
                message: 'Error creating course.',
                data: {
                    result: {}
                }
            };
            return responseDto;
        }
    }


    async purchaseCourse(userId: string, courseId: string, paymentIntentId: string): Promise<PurchaseCourseResponseDto> {
        try {
            const coursesCollectionRef = admin.firestore().collection('courses');
            const courseQuerySnapshot = await coursesCollectionRef.where('id', '==', courseId).get();

            if (courseQuerySnapshot.empty) {
                const response = new PurchaseCourseResponseDto('error',404, 'Course not found', {});
                return response;
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

                const response = new PurchaseCourseResponseDto('success',200, 'Course purchased successfully.', { courseId: courseId });
                return response;
            } else {
                const response = new PurchaseCourseResponseDto('error',400, 'Payment could not be completed', {});
                return response;
            }
        } catch (error) {
            console.error('Error purchasing course:', error);
            const response = new PurchaseCourseResponseDto('error', 400, 'Payment could not be completed', {});
            return response;
        }
    }




  
    async getPurchasedCourses(userId: string): Promise<GetCoursesResponseDto> {
        try {
            const usersRef = this.firebaseService.usersCollection;
            const usersQuery = query(usersRef, where('id', '==', userId));
            const usersQuerySnapshot = await getDocs(usersQuery);
            const userDoc = usersQuerySnapshot.docs[0];

            if (!userDoc) {
                return new GetCoursesResponseDto('error', 404, 'User could not be found.', {});
            }

            const userData = userDoc.data();

            if (!userData.purchasedCourses || userData.purchasedCourses.length === 0) {
                return new GetCoursesResponseDto('error', 404, 'User has no purchased courses', {});
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

            return new GetCoursesResponseDto('success',200, 'Courses retrieved successfully', purchasedCoursesDetails);
        } catch (error) {
            console.error('An error occurred:', error);
            return new GetCoursesResponseDto('error', 400, 'An error occurred retrieving the courses.', {});
        }
    }










    private async copyFileToStorage(sourceFilePath: string, destinationFilePath: string): Promise<void> {
        const fileBucket = admin.storage().bucket();
        const sourceFile = fileBucket.file(sourceFilePath);
        const destinationFile = fileBucket.file(destinationFilePath);
        await sourceFile.copy(destinationFile);
        console.log('File copied successfully:', destinationFilePath);
    }



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
                    status: 'success',
                    code: 200,
                    message: 'Course retrieved successfully.',
                    data: {
                        result: [{ userPicture: profilePicture, ...courseResult }],
                    },
                };
                console.log('Response created.');
                return getCourseResponse;
            } else {
                const getCourseResponse: GetCoursesResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Course not found',
                    data: {
                        result: {},
                    },
                };
                console.log('No courses found..');
                return getCourseResponse;
            }
        } catch (error) {
            console.error('An error occurred:', error);
            const getCourseResponse: GetCoursesResponseDto = {
                status: 'error',
                code: 400,
                message: 'Could not retrieve course due to an error.',
                data: {
                    result: {},
                },
            };
            return getCourseResponse;
        }
    }

}