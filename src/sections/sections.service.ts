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
                    continue;
                }

                const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
                const ebookQuery = query(ebookRef, where('id', '==', id));
                const ebookQuerySnapshot = await getDocs(ebookQuery);

                if (!ebookQuerySnapshot.empty) {
                    const ebookData = ebookQuerySnapshot.docs[0].data();
                    updatedContent.push(ebookData);
                    continue;
                }

                const errorMessage = 'Ebook or Media not found for id: ' + id;
                const responseDto = new CreateSectionResponseDto('error', 404, errorMessage, {});
                return responseDto;
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

            const newSectionDocId = newSectionDocRef.id; 

            await updateDoc(newSectionDocRef, { id: newSectionDocId });


            const cachedCourses = await this.firebaseService.getCollectionData('sections');
            cachedCourses.push({
                id: newSectionDocId,
                name,
                description,
                content: updatedContent,
                tags,
                active: true,
                subsections: [],
            });

            this.firebaseService.setCollectionData('sections', cachedCourses);
            console.log('Section added to the cache successfully.');

            const responseDto = new CreateSectionResponseDto('success', 201, 'Section created successfully', { sectionId: newSectionDocId });
            return responseDto;
        } catch (error) {
            console.error('Error creating section:', error);
            const errorMessage = 'The message could not be sent.';
            const responseDto = new CreateSectionResponseDto('error', 400, errorMessage, {});
            return responseDto;
        }
    }


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
                const errorMessage = 'Parent section not found.';
                const responseDto = new CreateSectionResponseDto('error', 404, errorMessage, {});
                return responseDto;
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
                    continue;
                }

                const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
                const ebookQuery = query(ebookRef, where('id', '==', id));
                const ebookQuerySnapshot = await getDocs(ebookQuery);

                if (!ebookQuerySnapshot.empty) {
                    const ebookData = ebookQuerySnapshot.docs[0].data();
                    updatedContent.push(ebookData);
                    continue;
                }

                const errorMessage = 'Ebook or media not found for id: ' + id;
                const responseDto = new CreateSectionResponseDto('error', 404, errorMessage, {});
                return responseDto;
            }

            const newSubsectionRef = await addDoc(collection(this.firebaseService.fireStore, 'sections'), {
                name: name,
                description: description,
                content: updatedContent,
                tags: tags,
                active: true,
            });

            const newSubsectionId = newSubsectionRef.id;

            if (!parentSectionData.subsections) {
                parentSectionData.subsections = [];
            }

            parentSectionData.subsections.push({
                id: newSubsectionId,
                name: name,
                description: description,
                content: updatedContent,
                tags: tags,
                active: true,
            });

            await updateDoc(parentSectionDoc.ref, parentSectionData);

            const cachedSections = await this.firebaseService.getCollectionData('sections');
            const updatedParentSection = cachedSections.find(section => section.id === parentSectionId);

            if (updatedParentSection) {
                updatedParentSection.subsections.push({
                    id: newSubsectionId,
                    name: name,
                    description: description,
                    content: updatedContent,
                    tags: tags,
                    active: true,
                });

                this.firebaseService.setCollectionData('sections', cachedSections);
                console.log('Subsection added to the cache successfully.');
            }

            const responseDto = new CreateSectionResponseDto('success', 201, 'Subsection created and added successfully.', { newSubsectionId });
            return responseDto;
        } catch (error) {
            console.error('Error creating and adding subsection to section:', error);
            const errorMessage = 'The subsection could not be added.';
            const responseDto = new CreateSectionResponseDto('error', 400, errorMessage, {});
            return responseDto;
        }
    }



  
    async updateSection(id: string, newData: Partial<UpdateSectionDto>): Promise<UpdateSectionResponseDto> {
        try {
            const sectionsCollectionRef = admin.firestore().collection('sections');

            const mainSectionsQuerySnapshot = await sectionsCollectionRef.where('id', '==', id).get();

            if (!mainSectionsQuerySnapshot.empty) {
                const batch = admin.firestore().batch();
                mainSectionsQuerySnapshot.forEach((doc) => {
                    batch.update(doc.ref, newData);
                });

                await batch.commit();
            } else {
                const sectionsQuerySnapshot = await sectionsCollectionRef.get();

                const batch = admin.firestore().batch();
                let foundInSection = false;
                sectionsQuerySnapshot.forEach((doc) => {
                    const subsections = doc.data().subsections || [];
                    const updatedSubsections = subsections.map((sub: any) => {
                        if (sub.id === id) {
                            foundInSection = true;
                            return { ...sub, ...newData };
                        }
                        return sub;
                    });
                    if (updatedSubsections !== subsections) {
                        batch.update(doc.ref, { subsections: updatedSubsections });
                    }
                });

                await batch.commit();

                if (foundInSection) {
                    console.log(`Updated info for subsection with ID "${id}"`);
                } else {
                    const errorMessage = 'Section not found.';
                    const responseDto = new UpdateSectionResponseDto('error', 404, errorMessage, {});
                    return responseDto;
                }
            }

            const cachedSections = await this.firebaseService.getCollectionData('sections');
            const updatedSectionIndex = cachedSections.findIndex((section) => section.id === id);
            if (updatedSectionIndex !== -1) {
                cachedSections[updatedSectionIndex] = { ...cachedSections[updatedSectionIndex], ...newData };
                this.firebaseService.setCollectionData('sections', cachedSections);
            }

            const responseDto = new UpdateSectionResponseDto('success',200, 'Section updated successfully.', {});
            return responseDto;
        } catch (error) {
            console.error('There was an error updating the section data:', error);
            const errorMessage = 'The section could not be updated.';
            const responseDto = new UpdateSectionResponseDto('error', 400, errorMessage, {});
            return responseDto;
        }
    }





 
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
                    status: 'success',
                    code: 200,
                    message: 'Sections retrieved successfully.',
                    data: {
                        result: activeSubsectionsWithActiveContent,
                    },
                };
                return getSectionsDtoResponse;
            }

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
                status: 'success',
                code: 200,
                message: 'Sections retrieved successfully.',
                data: {
                    result: activeSubsectionsWithActiveContent,
                },
            };
            console.log('Response created.');

            return getSectionsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            const errorMessage = 'There was an error retrieving the sections.';
            const responseDto = new GetSectionsResponseDto('error', 400, errorMessage, {});
            return responseDto;
        }
    }



   
    async getSectionsByKeywords(keywords: string | string[]): Promise<GetSectionsResponseDto> {
        try {
            console.log('Initializing getSectionsByKeywords...');

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
                    status: 'success',
                    code: 200,
                    message: 'Sections retrieved successfuly.',
                    data: {
                        result: formattedSections,
                    },
                };
                console.log('Response created.');

                return responseDto;
            }

            const responseDto: GetSectionsResponseDto = {
                status: 'error',
                code: 404,
                message: 'Sections not found.',
                data: {
                    result: [],
                },
            };
            console.log('Response created.');

            return responseDto;

        } catch (error) {
            console.error('An error occurred:', error);
            const errorMessage = 'There was an error retrieving the sections.';
            const responseDto = new GetSectionsResponseDto('error', 400, errorMessage, {});
            return responseDto;
        }
    }


    async addMediaOrEbookToSubsection(sectionId: string, subsectionId: string, resourceId: string): Promise<AddMediaOrEbookResponseDto> {
        try {
            const sectionsRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionsQuery = query(sectionsRef, where('id', '==', sectionId));
            const sectionsQuerySnapshot = await getDocs(sectionsQuery);

            if (!sectionsQuerySnapshot.empty) {
                const sectionDoc = sectionsQuerySnapshot.docs[0];
                const sectionData = sectionDoc.data();
                const { subsections } = sectionData;

                const findSubsectionAndUpdateContent = async (subsection: Section): Promise<boolean | AddMediaOrEbookResponseDto> => {
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
                                const responseDto: AddMediaOrEbookResponseDto = {
                                    status: 'error',
                                    code: 404,
                                    message: 'Asset not found.',
                                    data: {
                                        result: {},
                                    },
                                };
                                return responseDto;
                            }
                        }

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

                        const responseDto: AddMediaOrEbookResponseDto = {
                            status: 'success',
                            code: 200,
                            message: 'Asset added successfully.',
                            data: {
                                result: {},
                            },
                        };
                        return responseDto;
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
                        return new AddMediaOrEbookResponseDto('success', 200, 'Asset added succesfully.', {});
                    }
                }

                const responseDto: AddMediaOrEbookResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Subsection not found.',
                    data: {
                        result: {},
                    },
                };
                return responseDto;
            } else {
                const responseDto: AddMediaOrEbookResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Section not found.',
                    data: {
                        result: {},
                    },
                };
                return responseDto;
            }
        } catch (error) {
            console.error('Error adding Media or Ebook to subsection:', error);
            const responseDto: AddMediaOrEbookResponseDto = {
                status: 'error',
                code: 400,
                message: error.message || 'Error adding Media or Ebook to subsection.',
                data: {
                    result: {},
                },
            };
            return responseDto;
        }
    }


    async addMediaOrEbookToSection(sectionId: string, assetId: string): Promise<AddMediaOrEbookResponseDto> {
        try {
            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('id', '==', sectionId));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                const responseDto: AddMediaOrEbookResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Section not found.',
                    data: {
                        result: {},
                    },
                };
                return responseDto;
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
                const responseDto: AddMediaOrEbookResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Asset not found.',
                    data: {
                        result: {},
                    },
                };
                return responseDto;
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

            const responseDto: AddMediaOrEbookResponseDto = {
                status: 'success',
                code: 200,
                message: 'Asset added successfully.',
                data: {
                    result: {},
                },
            };
            return responseDto;
        } catch (error) {
            console.error('Error adding Media or Ebook to section:', error);
            const responseDto: AddMediaOrEbookResponseDto = {
                status: 'error',
                code: 400,
                message: error.message || 'Error adding Media or Ebook to section',
                data: {
                    result: {},
                },
            };
            return responseDto;
        }
    }

    async getSectionsByTags(tags: string | string[]): Promise<GetSectionsResponseDto> {
        try {
            console.log('Initializing getSectionsByTags...');

            const lowercaseTags = Array.isArray(tags) ? tags.map(tag => tag.toLowerCase()) : [tags.toLowerCase()];

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

            if (queryResult.length === 0) {
                const responseDto: GetSectionsResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'No sections found.',
                    data: {
                        result: [],
                    },
                };
                console.log('No sections found. Response created.');
                return responseDto;
            }


            const responseDto: GetSectionsResponseDto = {
                status: 'success',
                code: 200,
                message: 'Sections retrieved successfully.',
                data: {
                    result: formattedSections,
                },
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            const responseDto: GetSectionsResponseDto = {
                status: 'error',
                code: 400,
                message: 'Error retrieving sections',
                data: {
                    result: {},
                },
            };
            return responseDto;
        }
    }




    async getSectionContentById(sectionId: string): Promise<GetSectionsResponseDto> {
        try {
            console.log(`Initializing getSectionContentById for section ID: ${sectionId}...`);

            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionQuery = query(sectionsRef, where('id', '==', sectionId), where('active', '==', true));
            console.log('Section query created.');

            const sectionQuerySnapshot = await getDocs(sectionQuery);
            console.log('Section query snapshot obtained.');

            if (sectionQuerySnapshot.empty) {
                const responseDto: GetSectionsResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Section not found or not active.',
                    data: {
                        result: [],
                    },
                };
                console.log('Section not found or not active. Response created.');
                return responseDto;
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const sectionContent = sectionData.content.filter(item => item.active === true);
            const formattedContent = sectionContent.map(item => {
                if (item.uploadDate) {
                    item.uploadDate = convertFirestoreTimestamp(item.uploadDate);
                }
                if (item.releaseDate) {
                    item.releaseDate = convertFirestoreTimestamp(item.releaseDate);
                }
                return item;
            });

            const sectionsFound = [...formattedContent];

            console.log('Active section content and subsections retrieved successfully.');

            const responseDto: GetSectionsResponseDto = {
                status: 'success',
                code: 200,
                message: 'Sections retrieved successfully.',
                data: {
                    result: sectionsFound,
                },
            };

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            const responseDto: GetSectionsResponseDto = {
                status: 'error',
                code: 400,
                message: 'Error retrieving active sections content',
                data: {
                    result: {},
                },
            };
            return responseDto;
        }
    }





   
    async getSubsectionsBySectionId(sectionId: string): Promise<GetSectionsResponseDto> {
        try {
            console.log(`Initializing getSubsectionsBySectionId for section: ${sectionId}...`);

            const sectionsRef = this.firebaseService.sectionsCollection;
            const sectionQuery = query(sectionsRef, where('id', '==', sectionId), where('active', '==', true));
            console.log('Section query created.');

            const sectionQuerySnapshot = await getDocs(sectionQuery);
            console.log('Section query snapshot obtained.');

            if (sectionQuerySnapshot.empty) {
                const responseDto: GetSectionsResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Section not found or not active.',
                    data: {
                        result: [],
                    },
                };
                console.log('Section not found or not active. Response created.');
                return responseDto;
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const sectionSubsections = sectionData.subsections || [];

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

            const responseDto: GetSectionsResponseDto = {
                status: 'success',
                code: 200,
                message: 'Subsections retrieved successfully.',
                data: {
                    result: formattedSubsections,
                },
            };

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            const responseDto: GetSectionsResponseDto = {
                status: 'error',
                code: 400,
                message: 'Error retrieving active subsections with content',
                data: {
                    result: {},
                },
            };
            return responseDto;
        }
    }






    async deactivateMediaOrEbookFromSection(
        deactivateMediaOrEbookDto: DeactivateMediaOrEbookFromSectionDto
    ): Promise<DeleteSectionResponseDto> {
        try {
            const { name, title, type } = deactivateMediaOrEbookDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('name', '==', name));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                const responseDto: DeleteSectionResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Section not found.',
                    data: {
                        result: {},
                    },
                };
                console.log('Section not found. Response created.');
                return responseDto;
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const { content } = sectionData;

            const updatedContent = content.map(item => {
                if (item.title === title && (item.type === type || type === TypeOfResource.Ebook)) {
                    return { ...item, active: false };
                }
                return item;
            });

            await updateDoc(sectionDoc.ref, { content: updatedContent });

            console.log('Media or Ebook deactivated from section content successfully.');

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
                status: 'success',
                code: 200,
                message: 'Resource updated successfully.',
                data: {
                    result: {},
                },
            };

            return responseDto;
        } catch (error) {
            console.error('Error deactivating Media or Ebook from section:', error);
            const responseDto: DeleteSectionResponseDto = {
                status: 'error',
                code: 400,
                message: error.message || 'Error updating Media or Ebook from section',
                data: {
                    result: {},
                },
            };
            return responseDto;
        }
    }





   
    async activateMediaOrEbookInSection(
        activateMediaOrEbookDto: DeactivateMediaOrEbookFromSectionDto
    ): Promise<UpdateSectionResponseDto> {
        try {
            const { name, title, type } = activateMediaOrEbookDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('name', '==', name));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                const responseDto: UpdateSectionResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Section not found.',
                    data: {
                        result: {},
                    },
                };
                console.log('Section not found. Response created.');
                return responseDto;
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const { content } = sectionData;

            const updatedContent = content.map(item => {
                if (item.title === title && (item.type === type || type === TypeOfResource.Ebook)) {
                    return { ...item, active: true };
                }
                return item;
            });

            await updateDoc(sectionDoc.ref, { content: updatedContent });

            console.log('Media or Ebook activated in section content successfully.');

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
                status: 'success',
                code: 200,
                message: 'Asset updated successfully.',
                data: {
                    result: {},
                },
            };

            return responseDto;
        } catch (error) {
            console.error('Error activating Media or Ebook in section:', error);
            const responseDto: UpdateSectionResponseDto = {
                status: 'error',
                code: 400,
                message: error.message || 'Error activating Media or Ebook in section',
                data: {
                    result: {},
                },
            };
            return responseDto;
        }
    }




  
    async deactivateMediaOrEbookFromSubsection(
        deactivateMediaOrEbookDto: DeactivateMediaOrEbookFromSubsectionDto
    ): Promise<DeleteSectionResponseDto> {
        try {
            const { sectionName, subSectionName, title } = deactivateMediaOrEbookDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('name', '==', sectionName));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                const responseDto: DeleteSectionResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Section not found.',
                    data: {
                        result: {},
                    },
                };
                console.log('Section not found. Response created.');
                return responseDto;
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
                        status: 'success',
                        code: 200,
                        message: 'Asset updated successfully.',
                        data: {
                            result: {},
                        },
                    };
                    console.log('Resource deactivated successfully. Response created.');
                    return responseDto;
                }
            }

            const responseDto: DeleteSectionResponseDto = {
                status: 'error',
                code: 404,
                message: 'Subsection not found.',
                data: {
                    result: {},
                },
            };
            console.log('Subsection not found. Response created.');
            return responseDto;
        } catch (error) {
            console.error('Error deactivating Media or Ebook from sub-section:', error);
            const responseDto: DeleteSectionResponseDto = {
                status: 'error',
                code: 400,
                message: error.message || 'Error deactivating Media or Ebook from sub-section',
                data: {
                    result: {},
                },
            };
            return responseDto;
        }
    }





   
    async activateMediaOrEbookFromSubsection(
        activateMediaOrEbookDto: DeactivateMediaOrEbookFromSubsectionDto
    ): Promise<DeleteSectionResponseDto> {
        try {
            const { sectionName, subSectionName, title } = activateMediaOrEbookDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('name', '==', sectionName));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                const responseDto: DeleteSectionResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Section not found.',
                    data: {
                        result: {},
                    },
                };
                console.log('Section not found. Response created.');
                return responseDto;
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
                        status: 'success',
                        code: 200,
                        message: 'Asset updated successfully.',
                        data: {
                            result: {},
                        },
                    };
                    console.log('Resource activated successfully. Response created.');
                    return responseDto;
                }
            }

            const responseDto: DeleteSectionResponseDto = {
                status: 'error',
                code: 404,
                message: 'Subsection not found.',
                data: {
                    result: {},
                },
            };
            console.log('Subsection not found. Response created.');
            return responseDto;
        } catch (error) {
            console.error('Error activating Media or Ebook in sub-section:', error);
            const responseDto: DeleteSectionResponseDto = {
                status: 'error',
                code: 400,
                message: error.message || 'Error activating Media or Ebook in sub-section',
                data: {
                    result: {},
                },
            };
            return responseDto;
        }
    }






    async manageResourceStatus(id: string,
        manageResourceStatusDto: ManageResourceStatusInSectionDto
    ): Promise<ManageResourceStatusInSectionResponseDto> {
        const { active, assetIds } = manageResourceStatusDto;
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
            return new ManageResourceStatusInSectionResponseDto('success', 200, 'Asset updated successfully.', {});
        } else {
            console.log('Section not found.');
            return new ManageResourceStatusInSectionResponseDto('error', 404, 'Section not found.', {});
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








    async manageResourceStatusInSubsections(SubsectionId: string,
        manageResourceStatusDto: ManageResourceStatusInSubsectionDto
    ): Promise<ManageResourceStatusInSectionResponseDto> {
        const { SectionId, active, assetIds } = manageResourceStatusDto;
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
            return new ManageResourceStatusInSectionResponseDto('success', 200, 'Asset updated successfully.', {});
        } else {
            console.log('Subsection not found.');
            return new ManageResourceStatusInSectionResponseDto('error', 404, 'Subsection not found.', {});
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
