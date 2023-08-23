import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { addDoc, collection, CollectionReference, deleteDoc, DocumentData, DocumentReference, getDocs, orderBy, Query, query, QueryFieldFilterConstraint, updateDoc, where } from "firebase/firestore";
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
import { AddMediaOrEbookDto, ResourceType } from "./dto/addMediaorEbook.dto";
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

            const { name, description, assetsTitles, tags } = createNewSectionDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');

            const customSectionWhere: QueryFieldFilterConstraint = where('name', '==', name);
            const sectionQuery = query(sectionRef, customSectionWhere);
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (!sectionQuerySnapshot.empty) {
                throw new BadRequestException('NAME OF SECTION ALREADY EXISTS');
            }

            const updatedContent = []; // To store content with additional attributes

            for (const title of assetsTitles) {
                const mediaRef = collection(this.firebaseService.fireStore, 'media');
                const mediaQuery = query(mediaRef, where('title', '==', title));
                const mediaQuerySnapshot = await getDocs(mediaQuery);

                if (!mediaQuerySnapshot.empty) {
                    const mediaData = mediaQuerySnapshot.docs[0].data(); // Assuming only one match
                    updatedContent.push(mediaData);
                    continue; // Skip to the next title in assetsTitles
                }

                const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
                const ebookQuery = query(ebookRef, where('title', '==', title));
                const ebookQuerySnapshot = await getDocs(ebookQuery);

                if (!ebookQuerySnapshot.empty) {
                    const ebookData = ebookQuerySnapshot.docs[0].data(); // Assuming only one match
                    updatedContent.push(ebookData);
                    continue; // Skip to the next title in assetsTitles
                }

                throw new BadRequestException('TITLE NOT FOUND in MEDIA or EBOOKS: ' + title);
            }

            const newSectionId: string = uuidv4();

            const newSection: Section = {
                id: newSectionId,
                name: name,
                description: description,
                content: updatedContent, // Use updated content with additional attributes
                tags: tags,
                isActive: true,
                subsections: [],
            };

            const newSectionDocRef = await addDoc(sectionRef, newSection);

            const cachedCourses = await this.firebaseService.getCollectionData('sections');
            cachedCourses.push({
                id: newSectionId,
                name,
                description,
                content: updatedContent, // Use updated content with additional attributes
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








    @ApiOperation({ summary: 'Create and add a new subsection to a section' })
    @ApiCreatedResponse({ description: 'Subsection created and added successfully', type: CreateSectionResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request', type: Error }) 
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async createAndAddSubsectionToSection(
        parentSectionName: string,
        createSectionDto: CreateSectionDto
    ): Promise<CreateSectionResponseDto> {
        try {
            console.log('Creating and adding a new subsection...');

            const { name, description, assetsTitles, tags } = createSectionDto;

            const parentSectionRef = collection(this.firebaseService.fireStore, 'sections');
            const parentSectionQuery = query(parentSectionRef, where('name', '==', parentSectionName));
            const parentSectionQuerySnapshot = await getDocs(parentSectionQuery);

            if (parentSectionQuerySnapshot.empty) {
                throw new BadRequestException('PARENT SECTION NOT FOUND');
            }

            const parentSectionDoc = parentSectionQuerySnapshot.docs[0];
            const parentSectionData = parentSectionDoc.data();

            const updatedContent = []; // To store content with additional attributes

            for (const title of assetsTitles) {
                const mediaRef = collection(this.firebaseService.fireStore, 'media');
                const mediaQuery = query(mediaRef, where('title', '==', title));
                const mediaQuerySnapshot = await getDocs(mediaQuery);

                if (!mediaQuerySnapshot.empty) {
                    const mediaData = mediaQuerySnapshot.docs[0].data(); // Assuming only one match
                    updatedContent.push(mediaData);
                    continue; // Skip to the next title in assetsTitles
                }

                const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
                const ebookQuery = query(ebookRef, where('title', '==', title));
                const ebookQuerySnapshot = await getDocs(ebookQuery);

                if (!ebookQuerySnapshot.empty) {
                    const ebookData = ebookQuerySnapshot.docs[0].data(); // Assuming only one match
                    updatedContent.push(ebookData);
                    continue; // Skip to the next title in assetsTitles
                }

                throw new BadRequestException('TITLE NOT FOUND in MEDIA or EBOOKS: ' + title);
            }

            const newSubsectionId: string = uuidv4();

            const newSubsection: Section = {
                id: newSubsectionId,
                name: name,
                description: description,
                content: updatedContent, // Use updated content with additional attributes
                tags: tags,
                isActive: true,
            };

            if (!parentSectionData.subsections) {
                parentSectionData.subsections = [];
            }

            parentSectionData.subsections.push(newSubsection);
            await updateDoc(parentSectionDoc.ref, parentSectionData);



            // Update cached data
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            const updatedParentSection = cachedSections.find(section => section.name === parentSectionName);
            if (updatedParentSection) {
                updatedParentSection.subsections.push(newSubsection);
                this.firebaseService.setCollectionData('sections', cachedSections);
                console.log('Subsection added to the cache successfully.');
            }



            const responseDto = new CreateSectionResponseDto(201, 'SUBSECTION_CREATED_AND_ADDED_SUCCESSFULLY');
            return responseDto;
        } catch (error) {
            console.error('Error creating and adding subsection to section:', error);
            throw error;
        }
    }




    @ApiOperation({ summary: 'Update section by name' })
    @ApiOkResponse({ description: 'Section updated successfully', type: UpdateSectionResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async updateSection(name: string, newData: Partial<UpdateSectionDto>): Promise<UpdateSectionResponseDto> {
        try {
            console.log('Initializing updateSection...');
            const sectionsCollectionRef = admin.firestore().collection('sections');

            // First, search in main sections
            const mainSectionsQuerySnapshot = await sectionsCollectionRef.where('name', '==', name).get();

            if (!mainSectionsQuerySnapshot.empty) {
                const batch = admin.firestore().batch();
                mainSectionsQuerySnapshot.forEach((doc) => {
                    batch.update(doc.ref, newData);
                });

                await batch.commit();
                console.log(`Updated info for main section with name "${name}"`);
            } else {
                // If not found in main sections, search in subsections
                const sectionsQuerySnapshot = await sectionsCollectionRef.get();

                const batch = admin.firestore().batch();
                sectionsQuerySnapshot.forEach((doc) => {
                    const subsections = doc.data().subsections || [];
                    const updatedSubsections = subsections.map((sub: any) => {
                        if (sub.name === name) {
                            return { ...sub, ...newData };
                        }
                        return sub;
                    });
                    if (updatedSubsections !== subsections) {
                        batch.update(doc.ref, { subsections: updatedSubsections });
                    }
                });

                await batch.commit();
                console.log(`Updated info for subsection with name "${name}"`);
            }

            // Update cached sections
            const cachedSections = await this.firebaseService.getCollectionData('sections');
            const updatedSectionIndex = cachedSections.findIndex((section) => section.name === name);
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




    //NOT IN USE
    @ApiOperation({ summary: 'Update section by name' })
    @ApiOkResponse({ description: 'Section updated successfully'})
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
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



    @ApiOperation({ summary: 'Get active sections and subsections with active content' })
    @ApiOkResponse({ description: 'Success', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getSections(): Promise<GetSectionsResponseDto> {
        try {
            console.log('Initializing getSections...');

            const cachedSections = await this.firebaseService.getCollectionData('sections');
            if (cachedSections.length > 0) {
                console.log('Using cached sections data.');
                const activeSections = cachedSections.filter(section => section.isActive);
                const activeSectionsWithSubsections = activeSections.map(section => ({
                    ...section,
                    subsections: section.subsections.filter(subsection => subsection.isActive),
                }));

                const activeSubsectionsWithActiveContent = activeSectionsWithSubsections.map(section => ({
                    ...section,
                    subsections: section.subsections.map(subsection => ({
                        ...subsection,
                        content: subsection.content.filter(item => item.isActive),
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
            const sectionsQuery = query(sectionsRef, where('isActive', '==', true), orderBy('name'));

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

            const activeSections = queryResult.filter(section => section.isActive);
            const activeSectionsWithSubsections = activeSections.map(section => ({
                ...section,
                subsections: section.subsections.filter(subsection => subsection.isActive),
            }));

            const activeSubsectionsWithActiveContent = activeSectionsWithSubsections.map(section => ({
                ...section,
                subsections: section.subsections.map(subsection => ({
                    ...subsection,
                    content: subsection.content.filter(item => item.isActive),
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

                const filteredSubsections = matchedSections.map(section => ({
                    ...section,
                    subsections: section.subsections.filter(subsection => subsection.isActive)
                }));

                const subsectionsWithActiveContent = filteredSubsections.map(section => ({
                    ...section,
                    subsections: section.subsections.map(subsection => ({
                        ...subsection,
                        content: subsection.content.filter(item => item.isActive)
                    }))
                }));

                const responseDto: GetSectionsResponseDto = {
                    statusCode: 200,
                    message: 'SECTIONSGOT',
                    sectionsFound: subsectionsWithActiveContent,
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

            const filteredSubsections = matchedSections.map(section => ({
                ...section,
                subsections: section.subsections.filter(subsection => subsection.isActive)
            }));

            const subsectionsWithActiveContent = filteredSubsections.map(section => ({
                ...section,
                subsections: section.subsections.map(subsection => ({
                    ...subsection,
                    content: subsection.content.filter(item => item.isActive)
                }))
            }));

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('sections', queryResult);

            const responseDto: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'SECTIONSGOT',
                sectionsFound: subsectionsWithActiveContent,
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







    @ApiOperation({ summary: 'Add a media or ebook to a section' })
    @ApiCreatedResponse({ description: 'Success', type: AddMediaOrEbookResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request', type: BadRequestException })
    async addMediaOrEbookToSection(
        addMediaOrEbookDto: AddMediaOrEbookDto,
    ): Promise<AddMediaOrEbookResponseDto> {
        try {
            const { sectionName, typeOfResource, title } = addMediaOrEbookDto;

            const sectionRef = collection(this.firebaseService.fireStore, 'sections');
            const sectionQuery = query(sectionRef, where('name', '==', sectionName));
            const sectionQuerySnapshot = await getDocs(sectionQuery);

            if (sectionQuerySnapshot.empty) {
                throw new BadRequestException('SECTION NOT FOUND');
            }

            const sectionDoc = sectionQuerySnapshot.docs[0];
            const sectionData = sectionDoc.data();
            const { content } = sectionData;

            let resourceQuery: Query<DocumentData>;

            if (typeOfResource === ResourceType.Media) {
                resourceQuery = query(
                    collection(this.firebaseService.fireStore, 'media'),
                    where('title', '==', title)
                );
            } else if (typeOfResource === ResourceType.Ebook) {
                resourceQuery = query(
                    collection(this.firebaseService.fireStore, 'ebooks'),
                    where('title', '==', title)
                );
            } else {
                throw new BadRequestException('INVALID CONTENT TYPE');
            }

            const resourceQuerySnapshot = await getDocs(resourceQuery);

            if (resourceQuerySnapshot.empty) {
                throw new BadRequestException(`${typeOfResource.toUpperCase()} NOT FOUND`);
            }

            const resourceDoc = resourceQuerySnapshot.docs[0];
            const resource = resourceDoc.data();

            const updatedContent = [...content];

            if (typeOfResource === ResourceType.Media) {
                const mediaDto: Media = {
                    publisher: resource.type,
                    type: resource.type,
                    title: resource.title,
                    description: resource.description,
                    url: resource.url,
                    duration: resource.duration,
                    uploadDate: resource.uploadDate,
                };

                updatedContent.push(mediaDto);
            } else if (typeOfResource === ResourceType.Ebook) {
                const ebookDto: Ebook = {
                    title: resource.title,
                    publisher: resource.publisher,
                    author: resource.author,
                    description: resource.description,
                    titlePage: resource.titlePage,
                    url: resource.url,
                    price: resource.price,
                    releaseDate: resource.releaseDate,
                    language: resource.language,
                    pageCount: resource.pageCount,
                    genres: resource.genres,
                    format: resource.format,
                    salesCount: resource.salesCount,
                    isActive: resource.isActive,
                };

                updatedContent.push(ebookDto);
            }

            await updateDoc(sectionDoc.ref, { content: updatedContent });

            console.log('Media or Ebook added to section content successfully.');

            // Update cached sections data directly for efficiency
            const updatedSectionData = { ...sectionData, content: updatedContent };
            await updateDoc(sectionDoc.ref, updatedSectionData);

            return new AddMediaOrEbookResponseDto(201, 'MEDIAOREBOOKADDEDSUCCESSFULLY');
        } catch (error) {
            console.error('Error adding Media or Ebook to section:', error);
            throw error;
        }
    }




    @ApiOperation({ summary: 'Get sections by tags' })
    @ApiOkResponse({ description: 'Success', type: GetSectionsResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request', type: BadRequestException })
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

                const filteredSubsections = matchedSections.map(section => ({
                    ...section,
                    subsections: section.subsections.filter(subsection => subsection.isActive)
                }));

                const subsectionsWithActiveContent = filteredSubsections.map(section => ({
                    ...section,
                    subsections: section.subsections.map(subsection => ({
                        ...subsection,
                        content: subsection.content.filter(item => item.isActive)
                    }))
                }));

                const responseDto: GetSectionsResponseDto = {
                    statusCode: 200,
                    message: 'SECTIONSGOT',
                    sectionsFound: subsectionsWithActiveContent,
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

            const filteredSubsections = matchedSections.map(section => ({
                ...section,
                subsections: section.subsections.filter(subsection => subsection.isActive)
            }));

            const subsectionsWithActiveContent = filteredSubsections.map(section => ({
                ...section,
                subsections: section.subsections.map(subsection => ({
                    ...subsection,
                    content: subsection.content.filter(item => item.isActive)
                }))
            }));

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('sections', queryResult);

            const responseDto: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'SECTIONSGOT',
                sectionsFound: subsectionsWithActiveContent,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the sections.');
        }
    }







    @ApiOperation({ summary: 'Get active section content by name' })
    @ApiOkResponse({ description: 'Success', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
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
            const sectionContent = sectionData.content.filter(item => item.isActive === true);
            //  const sectionSubsections = sectionData.subsections || []; // Get subsections or use an empty array if none

            // Combine sectionContent and sectionSubsections into sectionsFound
            const sectionsFound = [...sectionContent,/* ...sectionSubsections*/];

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





    @ApiOperation({ summary: 'Get active subsections with content by section name' })
    @ApiOkResponse({ description: 'Got subsections using a sections name', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getSubsectionsBySectionName(sectionName: string): Promise<GetSectionsResponseDto> {
        try {
            console.log(`Initializing getSubsectionsBySectionName for section: ${sectionName}...`);

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
            const sectionSubsections = sectionData.subsections || [];

            // Filter active subsections and their content
            const activeSubsectionsWithContent = sectionSubsections
                .filter(subsection => subsection.isActive !== false)
                .map(subsection => {
                    const activeContent = subsection.content.filter(item => item.isActive !== false);
                    return { ...subsection, content: activeContent };
                });

            console.log('Active subsections with content retrieved successfully.');

            const getSectionsDtoResponse: GetSectionsResponseDto = {
                statusCode: 200,
                message: 'ACTIVE_SUBSECTIONS_WITH_CONTENT_RETRIEVED_SUCCESSFULLY',
                sectionsFound: activeSubsectionsWithContent,
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
                    return { ...item, isActive: false };
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
                    return { ...item, isActive: true };
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
                            return { ...item, isActive: false };
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
                            return { ...item, isActive: true };
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
        const { sectionName, isActive, assetTitles } = manageResourceStatusDto;
        const sectionsRef = collection(this.firebaseService.fireStore, 'sections');

        console.log('Fetching sections...');
        const sectionsQuerySnapshot = await getDocs(sectionsRef);

        let updated = false;

        for (const sectionSnapshot of sectionsQuerySnapshot.docs) {
            const sectionData = sectionSnapshot.data() as Section;

            if (sectionData.name === sectionName) {
                console.log(`Found matching section: ${sectionName}`);
                if (sectionData.content) {
                    for (const contentItem of sectionData.content) {
                        if ('title' in contentItem && assetTitles.some(title => contentItem.title === title)) {
                            console.log(`Updating content item: ${contentItem.title}`);
                            contentItem.isActive = isActive;
                            updated = true;
                            await updateDoc(sectionSnapshot.ref, { content: sectionData.content });

                        }
                    }
                }
            } else if (sectionData.subsections) {
                console.log(`Checking subsections of section: ${sectionData.name}`);
                updated = await this.searchInSectionsWithSubsections(sectionData.subsections, sectionName, assetTitles, isActive, updated, sectionSnapshot.ref, sectionData.content);
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
        isActive: boolean,
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
                            contentItem.isActive = isActive;
                            updated = true;
                        }
                    }
                }
            } else if (section.subsections) {
                updated = await this.searchInSectionsWithSubsections(section.subsections, targetSectionName, assetTitles, isActive, updated, sectionRef, updatedContent);
            }
        }

        if (updated) {
            await updateDoc(sectionRef, { content: updatedContent });
        }

        return updated;
    }








    async manageResourceStatusInSubsections(
        manageResourceStatusDto: ManageResourceStatusInSectionDto
    ): Promise<ManageResourceStatusInSectionResponseDto> {
        const { sectionName, isActive, assetTitles } = manageResourceStatusDto;
        const sectionsRef = collection(this.firebaseService.fireStore, 'sections');

        console.log('Fetching sections...');
        const sectionsQuerySnapshot = await getDocs(sectionsRef);

        let updated = false;

        for (const sectionSnapshot of sectionsQuerySnapshot.docs) {
            const sectionData = sectionSnapshot.data() as Section;

            if (sectionData.subsections) {
                console.log(`Checking subsections of section: ${sectionData.name}`);
                updated = await this.searchInSubsections(
                    sectionData.subsections,
                    sectionName,
                    assetTitles,
                    isActive,
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
        targetSectionName: string,
        assetTitles: string[],
        isActive: boolean,
        updated: boolean,
        sectionRef: DocumentReference
    ): Promise<boolean> {
        for (const subsection of subsections) {
            if (subsection.name === targetSectionName && subsection.content) {
                for (const contentItem of subsection.content) {
                    if ('title' in contentItem && assetTitles.some(title => contentItem.title === title)) {
                        console.log(`Updating content item in subsection: ${contentItem.title}`);
                        contentItem.isActive = isActive;
                        updated = true;
                        await updateDoc(sectionRef, { subsections });
                    }
                }
            }
            if (subsection.subsections) {
                updated = await this.searchInSubsections(
                    subsection.subsections,
                    targetSectionName,
                    assetTitles,
                    isActive,
                    updated,
                    sectionRef
                );
            }
        }
        return updated;
    }








}
