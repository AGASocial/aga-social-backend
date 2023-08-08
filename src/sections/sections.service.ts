import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { addDoc, collection, deleteDoc, getDocs, orderBy, query, QueryFieldFilterConstraint, where } from "firebase/firestore";
import { FirebaseService } from "../firebase/firebase.service";
import { CreateSectionDto } from "./dto/createSection.dto";
import { CreateSectionResponseDto } from "./dto/createSectionResponse.dto";
import { UpdateSectionDto } from "./dto/updateSection.dto";
import { UpdateSectionResponseDto } from "./dto/updateSectionResponse.dto";
import { Section } from "./entities/sections.entity";
import * as admin from 'firebase-admin';
import { DeleteSectionResponseDto } from "./dto/deleteSectionResponse.dto";
import { GetSectionsResponseDto } from "./dto/getSectionResponse.dto";




@Injectable()
export class SectionService {

    constructor(private firebaseService: FirebaseService) { }


    async createNewSection(createNewSectionDto: CreateSectionDto): Promise<CreateSectionResponseDto> {
        try {
            console.log('Creating a new section...');

            const { name, description, content, tags } = createNewSectionDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');

            const customSectionWhere: QueryFieldFilterConstraint = where('name', '==', name);
            const sectionQuery = query(sectionRef, customSectionWhere);
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (!sectionQuerySnapshot.empty) {
                throw new BadRequestException('NAME OF SECTION ALREADY EXISTS');
            }

            for (const item of content) {
                const mediaRef = collection(this.firebaseService.fireStore, 'media');
                const mediaQuery = query(mediaRef, where('url', '==', item.url));
                const mediaQuerySnapshot = await getDocs(mediaQuery);

                if (!mediaQuerySnapshot.empty) {
                    console.log('Media found for URL:', item.url);
                    continue; // Skip to the next item in content
                }

                const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
                const ebookQuery = query(ebookRef, where('url', '==', item.url));
                const ebookQuerySnapshot = await getDocs(ebookQuery);

                if (!ebookQuerySnapshot.empty) {
                    console.log('Ebook found for URL:', item.url);
                    continue; // Skip to the next item in content
                }

                throw new BadRequestException('URL NOT FOUND in MEDIA or EBOOKS: ' + item.url);
            }
            

            const newSection: Section = {
                name: name,
                description: description,
                content: content,
                tags: tags,
            };

            const newSectionDocRef = await addDoc(sectionRef, newSection);
            const newSectionId = newSectionDocRef.id;


            const cachedCourses = await this.firebaseService.getCollectionData('sections');
            cachedCourses.push({
                name,
                description,
                content,
                tags,
            });
            this.firebaseService.setCollectionData('sections', cachedCourses);
            console.log('Section added to the cache successfully.');


            const responseDto = new CreateSectionResponseDto(201, 'SECTIONCREATEDSUCCESSFULLY');
            return responseDto;
        } catch (error) {
            console.error('Error creating section:', error);
            throw error;
        }
    }


    async updateSection(name: string, description: string, newData: Partial<UpdateSectionDto>): Promise<UpdateSectionResponseDto> {
        try {
            console.log('Initializing updateSection...');
            const sectionsCollectionRef = admin.firestore().collection('sections');

            const querySnapshot = await sectionsCollectionRef.where('name', '==', name).get();

            if (querySnapshot.empty) {
                console.log(`The section with the name "${name}" does not exist.`);
                throw new Error('NAMEDOESNOTEXIST.');
            }

            const sectionsDoc = querySnapshot.docs[0];

            const sectionData = sectionsDoc.data() as Section;

            if (sectionData.description == description) {

                const batch = admin.firestore().batch();
                querySnapshot.forEach((doc) => {
                    batch.update(doc.ref, newData);
                });

                await batch.commit();
                console.log(`Updated info for section with name "${name}" and  description "${description}"`);

            } else {
                console.log(`Info for section with name "${name}" and  description "${description}" not found in the sections collection.`);
                throw new NotFoundException('SECTIONNOTFOUND');


            }


            const cachedCourses = await this.firebaseService.getCollectionData('sections');
            const updatedCourseIndex = cachedCourses.findIndex((section) => section.name === name);
            if (updatedCourseIndex !== -1) {
                cachedCourses[updatedCourseIndex] = { ...cachedCourses[updatedCourseIndex], ...newData };
                this.firebaseService.setCollectionData('sections', cachedCourses);
            }



            const response: UpdateSectionResponseDto = {
                statusCode: 200,
                message: 'SECTIONUPDATEDSUCCESSFULLY',
            };

            return response;
        } catch (error) {
            console.error('There was an error updating the ebook data:', error);
            throw error;
        }
    }


    async deleteSection(name: string, description: string): Promise<DeleteSectionResponseDto> {
        try {

            const sectionCollectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuerySnapshot = await getDocs(query(sectionCollectionRef, where('name', '==', name)));

            if (sectionQuerySnapshot.empty) {
                console.log(`Section with name "${name}" not found in the sections collection.`);
                throw new NotFoundException('SECTIONNOTFOUND');
            }
            const sectionsDoc = sectionQuerySnapshot.docs[0];

            const sectionData = sectionsDoc.data() as Section;



            if (sectionData.description == description) {
                await deleteDoc(sectionsDoc.ref);
            } else {
                console.log(`Section with name "${name}" and description "${description}" not found in the sections collection.`);
                throw new NotFoundException('SECTIONNOTFOUND');


            }


            const cachedCourses = await this.firebaseService.getCollectionData('sections');
            const indexToDelete = cachedCourses.findIndex((section) => section.name === name);

            if (indexToDelete !== -1) {
                cachedCourses.splice(indexToDelete, 1);
                this.firebaseService.setCollectionData('sections', cachedCourses);
            }


            const response: DeleteSectionResponseDto = {
                statusCode: 200,
                message: 'SECTIONDELETEDSUCCESSFULLY',
            };

            console.log(`The section has been deleted successfully.`);
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }


    async getSections(): Promise<GetSectionsResponseDto> {
        try {
            console.log('Initializing getSections...');

            // Tries to use data in cache if it exists
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            if (cachedSections.length > 0) {
                console.log('Using cached sections data.');
                const getSectionsDtoResponse: GetSectionsResponseDto = {
                    statusCode: 200,
                    message: "SECTIONSGOT",
                    sectionsFound: cachedSections,
                };
                return getSectionsDtoResponse;
            }

            // If there is no data, it uses firestore instead
            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionsQuery = query(sectionsRef, orderBy("name"));
            console.log('Sections query created.');

            const sectionsQuerySnapshot = await getDocs(sectionsQuery);
            console.log('Sections query snapshot obtained.');

            let queryResult = [];
            sectionsQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    name: data.name,
                    description: data.description,
                    tags: data.tags,
                    content: data.content,
                });
            });
            console.log('Sections data collected.');

            // the data is saved in cache for future queries
            this.firebaseService.setCollectionData('sections', queryResult);

            const getSectionsDtoResponse: GetSectionsResponseDto = {
                statusCode: 200,
                message: "SECTIONSGOT",
                sectionsFound: queryResult,
            };
            console.log('Response created.');

            return getSectionsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the sections.');
        }
    }



}
