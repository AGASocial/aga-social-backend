import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { addDoc, collection, CollectionReference, deleteDoc, doc, DocumentData, DocumentReference, getDocs, orderBy, Query, query, QueryFieldFilterConstraint, setDoc, updateDoc, where } from "firebase/firestore";
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
import { AddMediaOrEbookDto} from "./dto/addMediaorEbook.dto";
import { AddMediaOrEbookResponseDto } from "./dto/addMediaorEbookResponse.dto";
import { DocResult } from "../utils/docResult.entity";
import { DeactivateMediaOrEbookFromSectionDto, TypeOfResource } from "./dto/deactivateMediaOrEbookFromSection.dto";
import { DeactivateMediaOrEbookFromSubsectionDto } from "./dto/deactivateMediaOrEbookFromSubsection.dto";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { v4 as uuidv4 } from 'uuid';
import { Media } from "../media/entities/media.entity";
import { Ebook } from "../ebooks/entities/ebooks.entity";
import { ManageResourceStatusInSectionDto } from "./dto/manageResourceStatusInSection.dto";
import { ManageResourceStatusInSectionResponseDto } from "./dto/manageResourceStatusInSectionResponse.dto";
import { convertFirestoreTimestamp } from "../utils/timeUtils.dto";
import { ManageResourceStatusInSubsectionDto } from "./dto/manageResourceStatusInSubsection.dto";




@Injectable()
export class SectionService {

    constructor(private firebaseService: FirebaseService) { }



    @ApiOperation({ summary: 'Create a new section' })
    @ApiCreatedResponse({ description: 'Section created successfully', type: CreateSectionResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request', type: Error })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async createNewSection(createNewSectionDto: CreateSectionDto): Promise<CreateSectionResponseDto> {
        try {
            console.log('Creating a new section...');

            const { name, description, assetsIds, tags } = createNewSectionDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');



            const updatedContent = []; 

            for (const id of assetsIds) {
                const mediaRef = collection(this.firebaseService.fireStore, 'media');
                const mediaQuery = query(mediaRef, where('id', '==', id)); 
                const mediaQuerySnapshot = await getDocs(mediaQuery);

                if (!mediaQuerySnapshot.empty) {
                    const mediaData = mediaQuerySnapshot.docs[0].data();
                    updatedContent.push(mediaData);
                    continue; // Skip to the next id in assetsIds
                }

                const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
                const ebookQuery = query(ebookRef, where('id', '==', id)); 
                const ebookQuerySnapshot = await getDocs(ebookQuery);

                if (!ebookQuerySnapshot.empty) {
                    const ebookData = ebookQuerySnapshot.docs[0].data();
                    updatedContent.push(ebookData);
                    continue; // Skip to the next id in assetsIds
                }

                throw new BadRequestException('ID NOT FOUND in MEDIA or EBOOKS: ' + id);
            }

            const newSectionId: string = uuidv4();

            const newSection: Section = {
                id: newSectionId,
                name: name,
                description: description,
                content: updatedContent,
                tags: tags,
                active: true,
                subsections: [],
            };

            const newSectionDocRef = await addDoc(sectionRef, newSection);

            const cachedCourses = await this.firebaseService.getCollectionData('sections');
            cachedCourses.push({
                id: newSectionId,
                name,
                description,
                content: updatedContent, 
                tags,
                active: true,
                subsections: [],
            });

            this.firebaseService.setCollectionData('sections', cachedCourses);
            console.log('Section added to the cache successfully.');

            const responseDto = new CreateSectionResponseDto(201, 'SECTIONCREATEDSUCCESSFULLY', newSectionId);
            return responseDto;
        } catch (error) {
            console.error('Error creating section:', error);
            throw error;
        }
    }









    @ApiOperation({ summary: 'Create and add a new subsection to a section' })
    @ApiCreatedResponse({ description: 'Subsection created and added successfully', type: CreateSectionResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request', type: Error })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async createAndAddSubsectionToSection(
        parentSectionId: string,
        createSectionDto: CreateSectionDto
    ): Promise<CreateSectionResponseDto> {
        try {
            console.log('Creating and adding a new subsection...');

            const { name, description, assetsIds, tags } = createSectionDto;

            const parentSectionRef = collection(this.firebaseService.fireStore, 'sections');
            const parentSectionQuery = query(parentSectionRef, where('id', '==', parentSectionId));
            const parentSectionQuerySnapshot = await getDocs(parentSectionQuery);

            if (parentSectionQuerySnapshot.empty) {
                throw new BadRequestException('PARENT SECTION NOT FOUND');
            }

            const parentSectionDoc = parentSectionQuerySnapshot.docs[0];
            const parentSectionData = parentSectionDoc.data();

            const updatedContent = [];

            for (const id of assetsIds) {
                const mediaRef = collection(this.firebaseService.fireStore, 'media');
                const mediaQuery = query(mediaRef, where('id', '==', id));
                const mediaQuerySnapshot = await getDocs(mediaQuery);

                if (!mediaQuerySnapshot.empty) {
                    const mediaData = mediaQuerySnapshot.docs[0].data();
                    updatedContent.push(mediaData);
                    continue; // Skip to the next id in assetsIds
                }

                const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
                const ebookQuery = query(ebookRef, where('id', '==', id));
                const ebookQuerySnapshot = await getDocs(ebookQuery);

                if (!ebookQuerySnapshot.empty) {
                    const ebookData = ebookQuerySnapshot.docs[0].data();
                    updatedContent.push(ebookData);
                    continue; // Skip to the next id in assetsIds
                }

                throw new BadRequestException('ID NOT FOUND in MEDIA or EBOOKS: ' + id);
            }

            const newSubsectionId: string = uuidv4();

            const newSubsection: Section = {
                id: newSubsectionId,
                name: name,
                description: description,
                content: updatedContent,
                tags: tags,
                active: true,
            };

            if (!parentSectionData.subsections) {
                parentSectionData.subsections = [];
            }

            parentSectionData.subsections.push(newSubsection);
            await updateDoc(parentSectionDoc.ref, parentSectionData);

            // Update cached data
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            const updatedParentSection = cachedSections.find(section => section.id === parentSectionId);
            if (updatedParentSection) {
                updatedParentSection.subsections.push(newSubsection);
                this.firebaseService.setCollectionData('sections', cachedSections);
                console.log('Subsection added to the cache successfully.');
            }

            const responseDto = new CreateSectionResponseDto(201, 'SUBSECTION_CREATED_AND_ADDED_SUCCESSFULLY', newSubsectionId);
            return responseDto;
        } catch (error) {
            console.error('Error creating and adding subsection to section:', error);
            throw error;
        }
    }






    @ApiOperation({ summary: 'Update section by ID' })
    @ApiOkResponse({ description: 'Section updated successfully', type: UpdateSectionResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async updateSection(id: string, newData: Partial<UpdateSectionDto>): Promise<UpdateSectionResponseDto> {
        try {
            console.log('Initializing updateSection...');
            const sectionsCollectionRef = admin.firestore().collection('sections');

            const mainSectionsQuerySnapshot = await sectionsCollectionRef.where('id', '==', id).get();

            if (!mainSectionsQuerySnapshot.empty) {
                const batch = admin.firestore().batch();
                mainSectionsQuerySnapshot.forEach((doc) => {
                    batch.update(doc.ref, newData);
                });

                await batch.commit();
                console.log(`Updated info for main section with ID "${id}"`);
            } else {
                // If not found in main sections, search in subsections
                const sectionsQuerySnapshot = await sectionsCollectionRef.get();

                const batch = admin.firestore().batch();
                sectionsQuerySnapshot.forEach((doc) => {
                    const subsections = doc.data().subsections || [];
                    const updatedSubsections = subsections.map((sub: any) => {
                        if (sub.id === id) {
                            return { ...sub, ...newData };
                        }
                        return sub;
                    });
                    if (updatedSubsections !== subsections) {
                        batch.update(doc.ref, { subsections: updatedSubsections });
                    }
                });

                await batch.commit();
                console.log(`Updated info for subsection with ID "${id}"`);
            }

            // Update cached sections
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            const updatedSectionIndex = cachedSections.findIndex((section) => section.id === id);
            if (updatedSectionIndex !== -1) {
                cachedSections[updatedSectionIndex] = { ...cachedSections[updatedSectionIndex], ...newData };
                this.firebaseService.setCollectionData('sections', cachedSections);
            }

            const response: UpdateSectionResponseDto = {
                statusCode: 200,
                message: 'SECTIONUPDATEDSUCCESSFULLY',
            };

            return response;
        } catch (error) {
            console.error('There was an error updating the section data:', error);
            throw error;
        }
    }




    @ApiOperation({ summary: 'Get active sections and subsections with active content' })
    @ApiOkResponse({ description: 'Success', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getSections(): Promise<GetSectionsResponseDto> {
        try {
            console.log('Initializing getSections...');

            const cachedSections = await this.firebaseService.getCollectionData('sections');
            if (cachedSections.length > 0) {
                console.log('Using cached sections data.');
                const activeSections = cachedSections.filter(section => section.active);
                const activeSectionsWithSubsections = activeSections.map(section => ({
                    ...section,
                    subsections: section.subsections.filter(subsection => subsection.active),
                }));

                const activeSubsectionsWithActiveContent = activeSectionsWithSubsections.map(section => ({
                    ...section,
                    subsections: section.subsections.map(subsection => ({
                        ...subsection,
                        content: subsection.content.filter(item => item.active),
                    })),
                }));

                const getSectionsDtoResponse: GetSectionsResponseDto = {
                    statusCode: 200,
                    message: 'SECTIONSGOT',
                    sectionsFound: activeSubsectionsWithActiveContent,
                };
                return getSectionsDtoResponse;
            }

            // If there is no data, it uses firestore instead
            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionsQuery = query(sectionsRef, where('active', '==', true), orderBy('name'));

            const sectionsQuerySnapshot = await getDocs(sectionsQuery);
            console.log('Sections query snapshot obtained.');

            const queryResult = [];
            sectionsQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    subsections: data.subsections,
                });
            });
            console.log('Section data collected.');

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('sections', queryResult);

            const activeSections = queryResult.filter(section => section.active);
            const activeSectionsWithSubsections = activeSections.map(section => ({
                ...section,
                subsections: section.subsections.filter(subsection => subsection.active),
            }));

            const activeSubsectionsWithActiveContent = activeSectionsWithSubsections.map(section => ({
                ...section,
                subsections: section.subsections.map(subsection => ({
                    ...subsection,
                    content: subsection.content.filter(item => item.active),
                })),
            }));

            const getSectionsDtoResponse: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'SECTIONSGOT',
                sectionsFound: activeSubsectionsWithActiveContent,
            };
            console.log('Response created.');

            return getSectionsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the sections.');
        }
    }




    @ApiOperation({ summary: 'Get active sections and subsections with active content matching specified keywords on the title' })
    @ApiOkResponse({ description: 'Success', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getSectionsByKeywords(keywords: string | string[]): Promise<GetSectionsResponseDto> {
        try {
            console.log('Initializing getSectionsByKeywords...');

            // Convert keywords to an array if it's not already
            const lowercaseKeywords = Array.isArray(keywords) ? keywords.map(keyword => keyword.toLowerCase()) : [keywords.toLowerCase()];

            const sectionsRef = this.firebaseService.sectionsCollection;

            const sectionsQuerySnapshot = await getDocs(sectionsRef);
            console.log('Sections query snapshot obtained.');

            const queryResult = [];
            sectionsQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.active && lowercaseKeywords.some(keyword => data.name.toLowerCase().includes(keyword))) {
                    queryResult.push({
                        name: data.name,
                        description: data.description,
                        tags: data.tags,
                        content: data.content,
                        active: data.active,
                        subsections: data.subsections,
                    });
                }
            });
            console.log('Section data collected.');

            if (queryResult.length > 0) {
                // Format the dates
                const formattedSections = queryResult.map(matchedSection => ({
                    ...matchedSection,
                    subsections: matchedSection.subsections.filter(subsection => subsection.active)
                        .map(subsection => ({
                            ...subsection,
                            content: subsection.content.filter(item => item.active)
                                .map(item => ({
                                    ...item,
                                    uploadDate: convertFirestoreTimestamp(item.uploadDate),
                                    releaseDate: convertFirestoreTimestamp(item.releaseDate),
                                }))
                        }))
                }));

                const responseDto: GetSectionsResponseDto = {
                    statusCode: 200,
                    message: 'SECTIONSGOT',
                    sectionsFound: formattedSections,
                };
                console.log('Response created.');

                return responseDto;
            }

            const responseDto: GetSectionsResponseDto = {
                statusCode: 404,
                message: 'NOSECTIONFOUND',
                sectionsFound: [],
            };
            console.log('Response created.');

            return responseDto;

        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the sections.');
        }
    }











    @ApiOperation({ summary: 'Add a media or ebook to a subsection within a section' })
    @ApiCreatedResponse({ description: 'Success', type: AddMediaOrEbookResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request', type: BadRequestException })
    async addMediaOrEbookToSubsection(
        sectionId: string,
        subsectionId: string,
        resourceId: string
    ): Promise<AddMediaOrEbookResponseDto> {
        try {


            console.log('sectionId:', sectionId);
            console.log('subsectionId:', subsectionId);
            console.log('resourceId:', resourceId);



            const sectionsRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionsQuery = query(sectionsRef, where('id', '==', sectionId));
            const sectionsQuerySnapshot = await getDocs(sectionsQuery);

            if (sectionsQuerySnapshot.empty) {
                throw new BadRequestException('SECTION NOT FOUND');
            }

            const sectionDoc = sectionsQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const { subsections } = sectionData;

            const findSubsectionAndUpdateContent = async (subsection: Section): Promise<boolean> => {
                console.log('Checking subsection:', subsection.id);

                if (subsection.id === subsectionId) {
                    console.log('Found matching subsection:', subsectionId);
                    const updatedSubsectionContent = [...subsection.content];

                    const mediaQuery = query(collection(this.firebaseService.fireStore, 'media'), where('id', '==', resourceId));
                    const mediaQuerySnapshot = await getDocs(mediaQuery);

                    if (!mediaQuerySnapshot.empty) {
                        const mediaData = mediaQuerySnapshot.docs[0].data();
                        updatedSubsectionContent.push(mediaData);
                    } else {
                        const ebookQuery = query(collection(this.firebaseService.fireStore, 'ebooks'), where('id', '==', resourceId));
                        const ebookQuerySnapshot = await getDocs(ebookQuery);

                        if (!ebookQuerySnapshot.empty) {
                            const ebookData = ebookQuerySnapshot.docs[0].data();
                            updatedSubsectionContent.push(ebookData);
                        } else {
                            throw new BadRequestException('MEDIA OR EBOOK NOT FOUND');
                        }
                    }

                    // Update only the content of the subsection
                    const updatedSubsection = {
                        ...subsection,
                        content: updatedSubsectionContent,
                    };

                    const updatedSubsections = subsections.map((subsec: any) =>
                        subsec.id === subsectionId ? updatedSubsection : subsec
                    );

                    const updatedSection = {
                        ...sectionData,
                        subsections: updatedSubsections,
                    };

                    await updateDoc(sectionDoc.ref, updatedSection);

                    console.log('Media or Ebook added to subsection content successfully.');

                    // Update cached sections data
                    const cachedSections = await this.firebaseService.getCollectionData('sections');
                    const updatedCachedSections = cachedSections.map(cachedSection => {
                        if (cachedSection.id === sectionId) {
                            return {
                                ...cachedSection,
                                subsections: updatedSubsections,
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









    @ApiOperation({ summary: 'Add a media or ebook to a section' })
    @ApiCreatedResponse({ description: 'Success', type: AddMediaOrEbookResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request', type: BadRequestException })
    async addMediaOrEbookToSection(
        sectionId: string, assetId: string
    ): Promise<AddMediaOrEbookResponseDto> {
        try {

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('id', '==', sectionId));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                throw new BadRequestException('SECTION NOT FOUND');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const { content } = sectionData;

            const mediaRef = collection(this.firebaseService.fireStore, 'media');
            const mediaQuery = query(mediaRef, where('id', '==', assetId));
            const mediaQuerySnapshot = await getDocs(mediaQuery);

            const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
            const ebookQuery = query(ebookRef, where('id', '==', assetId));
            const ebookQuerySnapshot = await getDocs(ebookQuery);


            if (mediaQuerySnapshot.empty && ebookQuerySnapshot.empty) {
                throw new BadRequestException('ASSET NOT FOUND');
            }

            const updatedContent = [...content];

            if (!mediaQuerySnapshot.empty) {
                const mediaDoc = mediaQuerySnapshot.docs[0];
                const media = mediaDoc.data();


                const mediaDto: Media = {
                    publisher: media.publisher,
                    type: media.type,
                    title: media.title,
                    description: media.description,
                    url: media.url,
                    duration: media.duration,
                    uploadDate: media.uploadDate,
                    active: media.active !== undefined ? media.active : true, 
                };

                updatedContent.push(mediaDto);
            } else if (!ebookQuerySnapshot.empty) {
                const ebookDoc = ebookQuerySnapshot.docs[0];
                const ebook = ebookDoc.data();


                const ebookDto: Ebook = {
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
                    active: ebook.active !== undefined ? ebook.active : true, 
                };

                updatedContent.push(ebookDto);
            }


            const updatedSectionData = { ...sectionData, content: updatedContent };


            const sectionRefToUpdate = doc(this.firebaseService.fireStore, 'sections', sectionId);

            await setDoc(sectionRefToUpdate, updatedSectionData, { merge: true });

            console.log('Media or Ebook added to section content successfully.');

            return new AddMediaOrEbookResponseDto(201, 'MEDIAANDEBOOKADDEDSUCCESSFULLY');
        } catch (error) {
            console.error('Error adding Media or Ebook to section:', error);
            throw error;
        }
    }







    @ApiOperation({ summary: 'Get sections by tags' })
    @ApiOkResponse({ description: 'Success', type: GetSectionsResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request', type: BadRequestException })
    async getSectionsByTags(tags: string | string[]): Promise<GetSectionsResponseDto> {
        try {
            console.log('Initializing getSectionsByTags...');

            // Convert tags to an array if it's not already
            const lowercaseTags = Array.isArray(tags) ? tags.map(tag => tag.toLowerCase()) : [tags.toLowerCase()];

            // If there is no data in cache, query Firestore
            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionsQuery = query(sectionsRef, where('active', '==', true));
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
                    active: data.active,
                    subsections: data.subsections,
                });
            });
            console.log('Section data collected.');

            // Filter the sections by tags
            const matchedSections = queryResult.filter(section =>
                section.active && lowercaseTags.every(tag => section.tags.includes(tag))
            );

            const formattedSections = matchedSections.map(section => {
                return {
                    ...section,
                    subsections: section.subsections.filter(subsection => subsection.active)
                        .map(subsection => ({
                            ...subsection,
                            content: subsection.content.filter(item => item.active)
                        }))
                };
            });

            const responseDto: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'SECTIONSGOT',
                sectionsFound: formattedSections,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the sections.');
        }
    }









    @ApiOperation({ summary: 'Get active section content by section ID' })
    @ApiOkResponse({ description: 'Success', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getSectionContentById(sectionId: string): Promise<GetSectionsResponseDto> {
        try {
            console.log(`Initializing getSectionContentById for section ID: ${sectionId}...`);

            // Query the Firestore to get the section by ID and ensure it's active
            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionQuery = query(sectionsRef, where('id', '==', sectionId), where('active', '==', true));
            console.log('Section query created.');

            const sectionQuerySnapshot = await getDocs(sectionQuery);
            console.log('Section query snapshot obtained.');

            if (sectionQuerySnapshot.empty) {
                throw new Error('Section not found or not active.');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const sectionContent = sectionData.content.filter(item => item.active === true);

            // Convert Firestore timestamps to formatted date strings
            const formattedContent = sectionContent.map(item => {
                if (item.uploadDate) {
                    item.uploadDate = convertFirestoreTimestamp(item.uploadDate);
                }
                if (item.releaseDate) {
                    item.releaseDate = convertFirestoreTimestamp(item.releaseDate);
                }
                return item;
            });

            // Combine sectionContent and sectionSubsections into sectionsFound
            const sectionsFound = [...formattedContent/*, ...sectionSubsections*/];

            console.log('Active section content and subsections retrieved successfully.');

            const getSectionsDtoResponse: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'SECTIONSRETRIEVEDSUCCESSFULLY',
                sectionsFound: sectionsFound,
            };

            return getSectionsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the active section content.');
        }
    }





    @ApiOperation({ summary: 'Get active subsections with content by section ID' })
    @ApiOkResponse({ description: 'Got subsections using a section ID', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getSubsectionsBySectionId(sectionId: string): Promise<GetSectionsResponseDto> {
        try {
            console.log(`Initializing getSubsectionsBySectionId for section: ${sectionId}...`);

            // Query the Firestore to get the section by ID and ensure it's active
            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionQuery = query(sectionsRef, where('id', '==', sectionId), where('active', '==', true));
            console.log('Section query created.');

            const sectionQuerySnapshot = await getDocs(sectionQuery);
            console.log('Section query snapshot obtained.');

            if (sectionQuerySnapshot.empty) {
                throw new Error('Section not found or not active.');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const sectionSubsections = sectionData.subsections || [];

            // Convert Firestore timestamps to formatted date strings
            const formattedSubsections = sectionSubsections.map(subsection => {
                const formattedContent = subsection.content.map(item => {
                    if (item.uploadDate) {
                        item.uploadDate = convertFirestoreTimestamp(item.uploadDate);
                    }
                    if (item.releaseDate) {
                        item.releaseDate = convertFirestoreTimestamp(item.releaseDate);
                    }
                    return item;
                });
                return { ...subsection, content: formattedContent };
            });

            console.log('Active subsections with content retrieved successfully.');

            const getSectionsDtoResponse: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'ACTIVE_SUBSECTIONS_WITH_CONTENT_RETRIEVED_SUCCESSFULLY',
                sectionsFound: formattedSubsections,
            };

            return getSectionsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the active subsections with content.');
        }
    }







    @ApiOperation({ summary: 'Deactivate media or ebook from section' })
    @ApiOkResponse({ description: 'Success', type: DeleteSectionResponseDto })
    @ApiNotFoundResponse({ description: 'Section or resource not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async deactivateMediaOrEbookFromSection(
        deactivateMediaOrEbookDto: DeactivateMediaOrEbookFromSectionDto
    ): Promise<DeleteSectionResponseDto> {
        try {
            const { name, title, type } = deactivateMediaOrEbookDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('name', '==', name));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                throw new NotFoundException('SECTION_NOT_FOUND');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const { content } = sectionData;

            // Update isActive attribute for the deactivated media or ebook based on title and type
            const updatedContent = content.map(item => {
                if (item.title === title && (item.type === type || type === TypeOfResource.Ebook)) {
                    return { ...item, active: false };
                }
                return item;
            });

            await updateDoc(sectionDoc.ref, { content: updatedContent });

            console.log('Media or Ebook deactivated from section content successfully.');

            // Update cached sections data
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            const updatedCachedSections = cachedSections.map(section => {
                if (section.name === name) {
                    return {
                        ...section,
                        content: updatedContent,
                    };
                }
                return section;
            });
            await this.firebaseService.setCollectionData('sections', updatedCachedSections);

            const responseDto: DeleteSectionResponseDto = {
                statusCode: 200,
                message: 'RESOURCEDEACTIVATEDSUCCESSFULLY',
            };

            return responseDto;
        } catch (error) {
            console.error('Error deactivating Media or Ebook from section:', error);
            throw error;
        }
    }






    @ApiOperation({ summary: 'Activate media or ebook in section' })
    @ApiOkResponse({ description: 'Success', type: UpdateSectionResponseDto })
    @ApiNotFoundResponse({ description: 'Section or resource not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async activateMediaOrEbookInSection(
        activateMediaOrEbookDto: DeactivateMediaOrEbookFromSectionDto
    ): Promise<UpdateSectionResponseDto> {
        try {
            const { name, title, type } = activateMediaOrEbookDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('name', '==', name));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                throw new NotFoundException('SECTION_NOT_FOUND');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const { content } = sectionData;

            // Update isActive attribute for the activated media or ebook based on title and type
            const updatedContent = content.map(item => {
                if (item.title === title && (item.type === type || type === TypeOfResource.Ebook)) {
                    return { ...item, active: true };
                }
                return item;
            });

            await updateDoc(sectionDoc.ref, { content: updatedContent });

            console.log('Media or Ebook activated in section content successfully.');

            // Update cached sections data
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            const updatedCachedSections = cachedSections.map(section => {
                if (section.name === name) {
                    return {
                        ...section,
                        content: updatedContent,
                    };
                }
                return section;
            });
            await this.firebaseService.setCollectionData('sections', updatedCachedSections);

            const responseDto: UpdateSectionResponseDto = {
                statusCode: 200,
                message: 'RESOURCEACTIVATEDSUCCESSFULLY',
            };

            return responseDto;
        } catch (error) {
            console.error('Error activating Media or Ebook in section:', error);
            throw error;
        }
    }




    @ApiOperation({ summary: 'Deactivate media or ebook from subsection' })
    @ApiOkResponse({ description: 'Resource deactivated successfully', type: DeleteSectionResponseDto })
    @ApiNotFoundResponse({ description: 'Section or subsection or resource not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async deactivateMediaOrEbookFromSubsection(
        deactivateMediaOrEbookDto: DeactivateMediaOrEbookFromSubsectionDto
    ): Promise<DeleteSectionResponseDto> {
        try {
            const { sectionName, subSectionName, title } = deactivateMediaOrEbookDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('name', '==', sectionName));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                throw new NotFoundException('SECTION_NOT_FOUND');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const { subsections } = sectionData;

            const findSubsectionAndUpdateContent = async (subsection: Section): Promise<boolean> => {
                if (subsection.name === subSectionName) {
                    const updatedSubsectionContent = subsection.content.map(item => {
                        if (item.title === title) {
                            return { ...item, active: false };
                        }
                        return item;
                    });

                    subsection.content = updatedSubsectionContent;
                    await updateDoc(sectionDoc.ref, { subsections });

                    console.log('Media or Ebook deactivated from sub-section content successfully.');

                    // Update cached sections data
                    const cachedSections = await this.firebaseService.getCollectionData('sections');
                    const updatedCachedSections = cachedSections.map(section => {
                        if (section.name === sectionName) {
                            return {
                                ...section,
                                subsections,
                            };
                        }
                        return section;
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
                    const responseDto: DeleteSectionResponseDto = {
                        statusCode: 200,
                        message: 'RESOURCEDEACTIVATEDSUCCESSFULLY',
                    };

                    return responseDto;
                }
            }

            throw new NotFoundException('SUBSECTION_NOT_FOUND');
        } catch (error) {
            console.error('Error deactivating Media or Ebook from sub-section:', error);
            throw error;
        }
    }





    @ApiOperation({ summary: 'Activate media or ebook in subsection' })
    @ApiOkResponse({ description: 'Success', type: DeleteSectionResponseDto })
    @ApiNotFoundResponse({ description: 'Section or subsection or resource not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async activateMediaOrEbookFromSubsection(
        activateMediaOrEbookDto: DeactivateMediaOrEbookFromSubsectionDto
    ): Promise<DeleteSectionResponseDto> {
        try {
            const { sectionName, subSectionName, title } = activateMediaOrEbookDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('name', '==', sectionName));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                throw new NotFoundException('SECTION_NOT_FOUND');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const { subsections } = sectionData;

            const findSubsectionAndUpdateContent = async (subsection: Section): Promise<boolean> => {
                if (subsection.name === subSectionName) {
                    const updatedSubsectionContent = subsection.content.map(item => {
                        if (item.title === title) {
                            return { ...item, active: true };
                        }
                        return item;
                    });

                    subsection.content = updatedSubsectionContent;
                    await updateDoc(sectionDoc.ref, { subsections });

                    console.log('Media or Ebook activated in sub-section content successfully.');

                    // Update cached sections data
                    const cachedSections = await this.firebaseService.getCollectionData('sections');
                    const updatedCachedSections = cachedSections.map(section => {
                        if (section.name === sectionName) {
                            return {
                                ...section,
                                subsections,
                            };
                        }
                        return section;
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
                    const responseDto: DeleteSectionResponseDto = {
                        statusCode: 200,
                        message: 'RESOURCEACTIVATEDSUCCESSFULLY',
                    };

                    return responseDto;
                }
            }

            throw new NotFoundException('SUBSECTION_NOT_FOUND');
        } catch (error) {
            console.error('Error activating Media or Ebook in sub-section:', error);
            throw error;
        }
    }






    async manageResourceStatus(
        manageResourceStatusDto: ManageResourceStatusInSectionDto
    ): Promise<ManageResourceStatusInSectionResponseDto> {
        const { id, active, assetIds } = manageResourceStatusDto;
        const sectionsRef = collection(this.firebaseService.fireStore, 'sections');

        console.log('Fetching sections...');
        const sectionsQuerySnapshot = await getDocs(sectionsRef);

        let updated = false;

        for (const sectionSnapshot of sectionsQuerySnapshot.docs) {
            const sectionData = sectionSnapshot.data() as Section;

            if (sectionData.id === id) {
                console.log(`Found matching section: ${id}`);
                if (sectionData.content) {
                    for (const contentItem of sectionData.content) {
                        if ('title' in contentItem && assetIds.some(id => contentItem.id === id)) {
                            console.log(`Updating content item: ${contentItem.id}`);
                            contentItem.active = active;
                            updated = true;
                            await updateDoc(sectionSnapshot.ref, { content: sectionData.content });

                        }
                    }
                }
            } else if (sectionData.subsections) {
                console.log(`Checking subsections of section: ${sectionData.id}`);
                updated = await this.searchInSectionsWithSubsections(sectionData.subsections, id, assetIds, active, updated, sectionSnapshot.ref, sectionData.content);
            }
        }

        if (updated) {
            console.log('Resource status updated successfully.');
            return new ManageResourceStatusInSectionResponseDto(201, 'RESOURCEUPDATEDSUCCESSFULLY');
        } else {
            console.log('Section not found.');
            return new ManageResourceStatusInSectionResponseDto(404, 'SECTIONNOTFOUND');
        }





    }


    private async searchInSectionsWithSubsections(
        sections: Section[],
        targetSectionName: string,
        assetTitles: string[],
        active: boolean,
        updated: boolean,
        sectionRef: DocumentReference,
        updatedContent: any
    ): Promise<boolean> {
        for (const section of sections) {
            if (section.name === targetSectionName) {
                if (section.content) {
                    for (const contentItem of section.content) {
                        if ('title' in contentItem && assetTitles.includes(contentItem.title)) {
                            console.log(`Updating content item: ${contentItem.title}`);
                            contentItem.active = active;
                            updated = true;
                        }
                    }
                }
            } else if (section.subsections) {
                updated = await this.searchInSectionsWithSubsections(section.subsections, targetSectionName, assetTitles, active, updated, sectionRef, updatedContent);
            }
        }

        if (updated) {
            await updateDoc(sectionRef, { content: updatedContent });
        }

        return updated;
    }








    async manageResourceStatusInSubsections(
        manageResourceStatusDto: ManageResourceStatusInSubsectionDto
    ): Promise<ManageResourceStatusInSectionResponseDto> {
        const { SectionId, SubsectionId, active, assetIds } = manageResourceStatusDto; 
        const sectionsRef = collection(this.firebaseService.fireStore, 'sections');

        console.log('Fetching sections...');
        const sectionsQuerySnapshot = await getDocs(sectionsRef);

        let updated = false;

        for (const sectionSnapshot of sectionsQuerySnapshot.docs) {
            const sectionData = sectionSnapshot.data() as Section;

            if (sectionData.id === SectionId && sectionData.subsections) { 
                console.log(`Checking subsections of section: ${sectionData.id}`);
                updated = await this.searchInSubsections(
                    sectionData.subsections,
                    SubsectionId,
                    assetIds,
                    active,
                    updated,
                    sectionSnapshot.ref
                );
            }
        }

        if (updated) {
            console.log('Resource status updated successfully.');
            return new ManageResourceStatusInSectionResponseDto(201, 'RESOURCEUPDATEDSUCCESSFULLY');
        } else {
            console.log('Subsection not found.');
            return new ManageResourceStatusInSectionResponseDto(404, 'SUBSECTIONNOTFOUND');
        }
    }

    private async searchInSubsections(
        subsections: Section[],
        targetSubsectionId: string, 
        assetIds: string[], 
        active: boolean,
        updated: boolean,
        sectionRef: DocumentReference
    ): Promise<boolean> {
        for (const subsection of subsections) {
            if (subsection.id === targetSubsectionId && subsection.content) {
                for (const contentItem of subsection.content) {
                    if ('id' in contentItem && assetIds.includes(contentItem.id)) {
                        console.log(`Updating content item in subsection: ${contentItem.id}`);
                        contentItem.active = active;
                        updated = true;
                        await updateDoc(sectionRef, { subsections });
                    }
                }
            }
            if (subsection.subsections) {
                updated = await this.searchInSubsections(
                    subsection.subsections,
                    targetSubsectionId,
                    assetIds,
                    active,
                    updated,
                    sectionRef
                );
            }
        }
        return updated;
    }










}
