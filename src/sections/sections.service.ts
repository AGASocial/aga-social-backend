import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { addDoc, collection, deleteDoc, getDocs, orderBy, query, QueryFieldFilterConstraint, updateDoc, where } from "firebase/firestore";
import { FirebaseService } from "../firebase/firebase.service";
import { CreateSectionDto } from "./dto/createSection.dto";
import { CreateSectionResponseDto } from "./dto/createSectionResponse.dto";
import { UpdateSectionDto } from "./dto/updateSection.dto";
import { UpdateSectionResponseDto } from "./dto/updateSectionResponse.dto";
import { Section } from "./entities/sections.entity";
import * as admin from 'firebase-admin';
import { DeleteSectionResponseDto } from "./dto/deleteSectionResponse.dto";
import { GetSectionsResponseDto } from "./dto/getSectionResponse.dto";
import { CreateEbookDto } from "../ebooks/dto/createEbook.dto";
import { CreateMediaDto } from "../media/dto/createMedia.dto";
import { AddMediaOrEbookDto } from "./dto/addMediaorEbook.dto";
import { AddMediaOrEbookResponseDto } from "./dto/addMediaorEbookResponse.dto";
import { DocResult } from "../utils/docResult.entity";




@Injectable()
export class SectionService {

    constructor(private firebaseService: FirebaseService) { }


    async createNewSection(createNewSectionDto: CreateSectionDto): Promise<CreateSectionResponseDto> {
        try {
            console.log('Creating a new section...');

            const { name, description, content, tags} = createNewSectionDto;

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
                isActive: true,
                subsections: [],
            };

            const newSectionDocRef = await addDoc(sectionRef, newSection);
            const newSectionId = newSectionDocRef.id;


            const cachedCourses = await this.firebaseService.getCollectionData('sections');
            cachedCourses.push({
                name,
                description,
                content,
                tags,
                isActive: true,
                subsections: [],

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




    async createAndAddSubsectionToSection(
        parentSectionName: string,
        createSectionDto: CreateSectionDto
    ): Promise<CreateSectionResponseDto> {
        try {
            console.log('Creating and adding a new subsection...');

            const { name, description, content, tags } = createSectionDto;

            const parentSectionRef = collection(this.firebaseService.fireStore, 'sections');
            const parentSectionQuery = query(parentSectionRef, where('name', '==', parentSectionName));
            const parentSectionQuerySnapshot = await getDocs(parentSectionQuery);

            if (parentSectionQuerySnapshot.empty) {
                throw new BadRequestException('PARENT SECTION NOT FOUND');
            }

            const parentSectionDoc = parentSectionQuerySnapshot.docs[0];
            const parentSectionData = parentSectionDoc.data();

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

            const newSubsection: Section = {
                name: name,
                description: description,
                content: content,
                tags: tags,
                isActive: true,
            };

            if (!parentSectionData.subsections) {
                parentSectionData.subsections = [];
            }

            parentSectionData.subsections.push(newSubsection);
            await updateDoc(parentSectionDoc.ref, parentSectionData);

            const responseDto = new CreateSectionResponseDto(201, 'SUBSECTION_CREATED_AND_ADDED_SUCCESSFULLY');
            return responseDto;
        } catch (error) {
            console.error('Error creating and adding subsection to section:', error);
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


    //NOT IN USE
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



    async deactivateSection(name: string, description: string): Promise<DeleteSectionResponseDto> {
        try {
            const sectionCollectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuerySnapshot = await getDocs(query(sectionCollectionRef, where('name', '==', name)));

            if (sectionQuerySnapshot.empty) {
                console.log(`Section with name "${name}" not found in the sections collection.`);
                throw new NotFoundException('SECTIONNOTFOUND');
            }

            const sectionsDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionsDoc.data() as Section;

            if (sectionData.description === description) {
                // Update isActive attribute to false
                await updateDoc(sectionsDoc.ref, { isActive: false });
            } else {
                console.log(`Section with name "${name}" and description "${description}" not found in the sections collection.`);
                throw new NotFoundException('SECTIONNOTFOUND');
            }

            const cachedSections = await this.firebaseService.getCollectionData('sections');
            const indexToUpdate = cachedSections.findIndex((section) => section.name === name);

            if (indexToUpdate !== -1) {
                cachedSections[indexToUpdate].isActive = false; // Update isActive attribute
                this.firebaseService.setCollectionData('sections', cachedSections);
            }

            const response: DeleteSectionResponseDto = {
                statusCode: 200,
                message: 'SECTIONDEACTIVATEDSUCCESSFULLY',
            };

            console.log(`The section has been deactivated successfully.`);
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }




    async deactivateSubsection(
        parentSectionName: string,
        subsectionName: string
    ): Promise<DeleteSectionResponseDto> {
        try {
            console.log('Deactivating a subsection...');

            const sectionsRef = collection(this.firebaseService.fireStore, 'sections');
            const parentSectionQuery = query(sectionsRef, where('name', '==', parentSectionName));
            const parentSectionQuerySnapshot = await getDocs(parentSectionQuery);

            if (parentSectionQuerySnapshot.empty) {
                throw new BadRequestException('PARENT SECTION NOT FOUND');
            }

            const parentSectionDoc = parentSectionQuerySnapshot.docs[0];
            const parentSectionData = parentSectionDoc.data();
            const { subsections } = parentSectionData;

            const findAndDeactivateSubsection = async (subsection: Section): Promise<boolean> => {
                if (subsection.name === subsectionName) {
                    subsection.isActive = false;
                    await updateDoc(parentSectionDoc.ref, { subsections });

                    console.log('Subsection deactivated successfully.');

                    // Update cached sections data
                    const cachedSections = await this.firebaseService.getCollectionData('sections');
                    const updatedCachedSections = cachedSections.map(cachedSection => {
                        if (cachedSection.name === parentSectionName) {
                            return {
                                ...cachedSection,
                                subsections,
                            };
                        }
                        return cachedSection;
                    });
                    await this.firebaseService.setCollectionData('sections', updatedCachedSections);

                    return true;
                }

                if (subsection.subsections) {
                    for (const subsubsection of subsection.subsections) {
                        if (await findAndDeactivateSubsection(subsubsection)) {
                            return true;
                        }
                    }
                }

                return false;
            };

            for (const subsection of subsections) {
                if (await findAndDeactivateSubsection(subsection)) {
                    const response: DeleteSectionResponseDto = {
                        statusCode: 200,
                        message: 'SECTIONDEACTIVATEDSUCCESSFULLY',
                    };

                    console.log(`The section has been deactivated successfully.`);
                    return response;
                }
            }

            throw new BadRequestException('SUBSECTION NOT FOUND');
        } catch (error) {
            console.error('Error deactivating subsection:', error);
            throw error;
        }
    }








    async getSections(): Promise<GetSectionsResponseDto> {
        try {
            console.log('Initializing getSections...');

            // Tries to use data in cache if it exists
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            if (cachedSections.length > 0) {
                console.log('Using cached sections data.');
                const activeSections = cachedSections.filter(section => section.isActive);
                const getSectionsDtoResponse: GetSectionsResponseDto = {
                    statusCode: 200,
                    message: 'SECTIONSGOT',
                    sectionsFound: activeSections,
                };
                return getSectionsDtoResponse;
            }

            // If there is no data, it uses firestore instead
            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionsQuery = query(sectionsRef, where('isActive', '==', true), orderBy('name'));
            console.log('Sections query created.');

            const sectionsQuerySnapshot = await getDocs(sectionsQuery);
            console.log('Sections query snapshot obtained.');

            const queryResult = [];
            sectionsQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    name: data.name,
                    description: data.description,
                    tags: data.tags,
                    content: data.content,
                    isActive: data.isActive,
                    subsections: data.subsections,
                });
            });
            console.log('Section data collected.');

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('sections', queryResult);

            const activeSections = queryResult.filter(section => section.isActive);
            const getSectionsDtoResponse: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'SECTIONSGOT',
                sectionsFound: activeSections,
            };
            console.log('Response created.');

            return getSectionsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the sections.');
        }
    }






    async getSectionsByKeywords(keywords: string[]): Promise<GetSectionsResponseDto> {
        try {
            console.log('Initializing getSectionsByKeywords...');

            // Tries to use data in cache if it exists
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            if (cachedSections.length > 0) {
                console.log('Using cached sections data.');
                const matchedSections = cachedSections.filter(section =>
                    section.isActive === true &&
                    keywords.some(keyword => section.name.toLowerCase().includes(keyword.toLowerCase()))
                );

                const responseDto: GetSectionsResponseDto = {
                    statusCode: 200,
                    message: 'SECTIONSGOT',
                    sectionsFound: matchedSections,
                };
                return responseDto;
            }

            // If there is no data in cache, query Firestore
            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionsQuery = query(sectionsRef, where('isActive', '==', true), orderBy('name'));
            console.log('Sections query created.');

            const sectionsQuerySnapshot = await getDocs(sectionsQuery);
            console.log('Sections query snapshot obtained.');

            const queryResult = [];
            sectionsQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    name: data.name,
                    description: data.description,
                    tags: data.tags,
                    content: data.content,
                    isActive: data.isActive,
                    subsections: data.subsections,

                });
            });
            console.log('Section data collected.');

            // Filter the sections by keywords
            const matchedSections = queryResult.filter(section =>
                keywords.some(keyword => section.name.toLowerCase().includes(keyword.toLowerCase()))
            );

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('sections', queryResult);

            const responseDto: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'SECTIONSGOT',
                sectionsFound: matchedSections,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the sections.');
        }
    }





    async addMediaOrEbookToSubsection(
        mediaOrEbookData: CreateMediaDto | CreateEbookDto,
        parentSectionName: string,
        subsectionName: string
    ): Promise<AddMediaOrEbookResponseDto> {
        try {
            const sectionsRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionsQuery = query(sectionsRef, where('name', '==', parentSectionName));
            const sectionsQuerySnapshot = await getDocs(sectionsQuery);

            if (sectionsQuerySnapshot.empty) {
                throw new BadRequestException('PARENT SECTION NOT FOUND');
            }

            const parentSectionDoc = sectionsQuerySnapshot.docs[0];
            const parentSectionData = parentSectionDoc.data();
            const { subsections } = parentSectionData;

            const findSubsectionAndUpdateContent = async (subsection: Section): Promise<boolean> => {
                if (subsection.name === subsectionName) {
                    const updatedSubsectionContent = [...subsection.content];

                    if ('duration' in mediaOrEbookData) { // This is a Media
                        const mediaDto: CreateMediaDto = mediaOrEbookData;
                        updatedSubsectionContent.push(mediaDto);
                    } else if ('pageCount' in mediaOrEbookData) { // This is an Ebook
                        const ebookDto: CreateEbookDto = mediaOrEbookData;
                        updatedSubsectionContent.push(ebookDto);
                    } else {
                        throw new BadRequestException('INVALID CONTENT TYPE');
                    }

                    await updateDoc(parentSectionDoc.ref, { subsections });

                    console.log('Media or Ebook added to subsection content successfully.');

                    // Update cached sections data
                    const cachedSections = await this.firebaseService.getCollectionData('sections');
                    const updatedCachedSections = cachedSections.map(cachedSection => {
                        if (cachedSection.name === parentSectionName) {
                            return {
                                ...cachedSection,
                                subsections,
                            };
                        }
                        return cachedSection;
                    });
                    await this.firebaseService.setCollectionData('sections', updatedCachedSections);

                    return true;
                }

                if (subsection.subsections) {
                    for (const subsubsection of subsection.subsections) {
                        if (await findSubsectionAndUpdateContent(subsubsection)) {
                            return true;
                        }
                    }
                }

                return false;
            };

            for (const subsection of subsections) {
                if (await findSubsectionAndUpdateContent(subsection)) {
                    return new AddMediaOrEbookResponseDto(201, 'MEDIAOREBOOKADDEDSUCCESSFULLY');
                }
            }

            throw new BadRequestException('SUBSECTION NOT FOUND');
        } catch (error) {
            console.error('Error adding Media or Ebook to subsection:', error);
            throw error;
        }
    }








    async addMediaOrEbookToSection(
        addMediaOrEbookDto: AddMediaOrEbookDto,
    ): Promise<AddMediaOrEbookResponseDto> {
        try {
            const { sectionName, mediaOrEbookData } = addMediaOrEbookDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('name', '==', sectionName));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                throw new BadRequestException('SECTION NOT FOUND');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const { content } = sectionData;

            const updatedContent = [...content]; // Create a copy of existing content

            if ('duration' in mediaOrEbookData) { // This is a Media
                const mediaQuery = query(
                    collection(this.firebaseService.fireStore, 'media'),
                    where('url', '==', mediaOrEbookData.url)
                );
                const mediaQuerySnapshot = await getDocs(mediaQuery);

                if (!mediaQuerySnapshot.empty) {
                    const mediaDoc = mediaQuerySnapshot.docs[0];
                    const media = mediaDoc.data();

                    const mediaDto: CreateMediaDto = {
                        type: media.type,
                        title: media.title,
                        description: media.description,
                        url: media.url,
                        duration: media.duration,
                        uploadDate: media.uploadDate,
                    };

                    updatedContent.push(mediaDto);
                }
            } else if ('pageCount' in mediaOrEbookData) { // This is an Ebook
                const ebookQuery = query(
                    collection(this.firebaseService.fireStore, 'ebooks'),
                    where('url', '==', mediaOrEbookData.url)
                );
                const ebookQuerySnapshot = await getDocs(ebookQuery);

                if (!ebookQuerySnapshot.empty) {
                    const ebookDoc = ebookQuerySnapshot.docs[0];
                    const ebook = ebookDoc.data();

                    const ebookDto: CreateEbookDto = {
                        title: ebook.title,
                        publisher: ebook.publisher,
                        author: ebook.author,
                        description: ebook.description,
                        titlePage: ebook.titlePage,
                        url: ebook.url,
                        price: ebook.price,
                        releaseDate: ebook.releaseDate,
                        language: ebook.language,
                        pageCount: ebook.pageCount,
                        genres: ebook.genres,
                        format: ebook.format,
                        salesCount: ebook.salesCount,
                    };

                    updatedContent.push(ebookDto);
                }
            } else {
                throw new BadRequestException('INVALID CONTENT TYPE');
            }

            await updateDoc(sectionDoc.ref, { content: updatedContent });

            console.log('Media or Ebook added to section content successfully.');



            // Update cached sections data
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            const updatedCachedSections = cachedSections.map(section => {
                if (section.name === sectionName) {
                    return {
                        ...section,
                        content: updatedContent,
                    };
                }
                return section;
            });
            await this.firebaseService.setCollectionData('sections', updatedCachedSections);


            return new AddMediaOrEbookResponseDto(201, 'MEDIAOREBOOKADDEDSUCCESSFULLY');
        } catch (error) {
            console.error('Error adding Media or Ebook to section:', error);
            throw error;
        }
    }


    async getSectionsByTags(tags: string[]): Promise<GetSectionsResponseDto> {
        try {
            console.log('Initializing getSectionsByTags...');

            // Convert all tags to lowercase for case-insensitive comparison
            const lowercaseTags = tags.map(tag => tag.toLowerCase());

            // Tries to use data in cache if it exists
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            if (cachedSections.length > 0) {
                console.log('Using cached sections data.');
                const matchedSections = cachedSections.filter(section =>
                    section.isActive && section.tags.some(tag => lowercaseTags.includes(tag.toLowerCase()))
                );

                const responseDto: GetSectionsResponseDto = {
                    statusCode: 200,
                    message: 'SECTIONSGOT',
                    sectionsFound: matchedSections,
                };
                return responseDto;
            }

            // If there is no data in cache, query Firestore
            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionsQuery = query(sectionsRef, where('isActive', '==', true));
            console.log('Sections query created.');

            const sectionsQuerySnapshot = await getDocs(sectionsQuery);
            console.log('Sections query snapshot obtained.');

            const queryResult = [];
            sectionsQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    name: data.name,
                    description: data.description,
                    tags: data.tags,
                    content: data.content,
                    isActive: data.isActive,
                    subsections: data.subsections,
                });
            });
            console.log('Section data collected.');

            // Filter the sections by tags
            const matchedSections = queryResult.filter(section =>
                section.isActive && section.tags.some(tag => lowercaseTags.includes(tag.toLowerCase()))
            );

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('sections', queryResult);

            const responseDto: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'SECTIONSGOT',
                sectionsFound: matchedSections,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the sections.');
        }
    }







  
    async getSectionContentByName(sectionName: string): Promise<GetSectionsResponseDto> {
        try {
            console.log(`Initializing getSectionContentByName for section: ${sectionName}...`);

            // Query the Firestore to get the section by name and ensure it's active
            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionQuery = query(sectionsRef, where('name', '==', sectionName), where('isActive', '==', true));
            console.log('Section query created.');

            const sectionQuerySnapshot = await getDocs(sectionQuery);
            console.log('Section query snapshot obtained.');

            if (sectionQuerySnapshot.empty) {
                throw new Error('Section not found or not active.');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const sectionContent = sectionData.content;
          //  const sectionSubsections = sectionData.subsections || []; // Get subsections or use an empty array if none

            // Combine sectionContent and sectionSubsections into sectionsFound
            const sectionsFound = [...sectionContent,/* ...sectionSubsections*/];

            console.log('Section content and subsections retrieved successfully.');

            const getSectionsDtoResponse: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'SECTIONSRETRIEVEDSUCCESSFULLY',
                sectionsFound: sectionsFound,
            };

            return getSectionsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the section content.');
        }
    }





    async getSubsectionsBySectionName(sectionName: string): Promise<GetSectionsResponseDto> {
        try {
            console.log(`Initializing getActiveSubsectionsBySectionName for section: ${sectionName}...`);

            // Query the Firestore to get the section by name and ensure it's active
            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionQuery = query(sectionsRef, where('name', '==', sectionName), where('isActive', '==', true));
            console.log('Section query created.');

            const sectionQuerySnapshot = await getDocs(sectionQuery);
            console.log('Section query snapshot obtained.');

            if (sectionQuerySnapshot.empty) {
                throw new Error('Section not found or not active.');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const sectionSubsections = sectionData.subsections || []; // Get subsections or use an empty array if none

            // Filter active subsections
            const activeSubsections = sectionSubsections.filter(subsection => subsection.isActive !== false);

            console.log('Active subsections retrieved successfully.');

            const getSectionsDtoResponse: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'ACTIVE_SUBSECTIONS_RETRIEVED_SUCCESSFULLY',
                sectionsFound: activeSubsections,
            };

            return getSectionsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the active subsections.');
        }
    }









}
