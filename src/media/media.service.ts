import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DocumentReference, DocumentSnapshot, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, collection, where, deleteDoc, QueryFieldFilterConstraint, addDoc } from 'firebase/firestore';
import * as admin from 'firebase-admin';
import { CreateMediaDto } from './dto/createMedia.dto';
import { CreateMediaResponseDto } from './dto/createMediaResponse.dto';
import { Media } from './entities/media.entity';
import { UpdateMediaDto } from './dto/updateMedia.dto';
import { UpdateMediaResponseDto } from './dto/updateMediaResponse.dto';
import { GetMediaResponseDto } from './dto/getMediaResponse.dto';
import { DeleteMediaResponseDto } from './dto/deleteMediaResponse.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { Request } from 'express';
import { FileFields } from 'formidable';
import { Readable } from 'stream';
import { UploadMediaResponseDto } from './dto/uploadMediaFileResponse.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';




@Injectable()
export class MediaService {

    constructor(private firebaseService: FirebaseService) { }



    @ApiOperation({ summary: 'Create a new media and register it on Firestore using a dto with its basic data' })
    @ApiBadRequestResponse({ description: 'URL or title already exists' })
    @ApiCreatedResponse({
        description: 'The media has been successfully created.',
        type: CreateMediaResponseDto,
    })
    async createNewMedia(createNewMediaDto: CreateMediaDto): Promise<CreateMediaResponseDto> {
        const { type, title, description, url, duration, publisher } = createNewMediaDto;
        const mediaRef = collection(this.firebaseService.fireStore, 'media');

        const customMediaWhere: QueryFieldFilterConstraint = where('url', '==', url);
        const mediaQuery = query(mediaRef, customMediaWhere);
        const mediaQuerySnapshot = await getDocs(mediaQuery);

        if (!mediaQuerySnapshot.empty) {
            throw new BadRequestException('URL ALREADY EXISTS');
        }


        // Check if the title already exists in the collection
        const titleQuery = query(mediaRef, where('title', '==', title));
        const titleQuerySnapshot = await getDocs(titleQuery);

        if (!titleQuerySnapshot.empty) {
            throw new BadRequestException('TITLE ALREADY EXISTS');
        }

        const newMediaId: string = uuidv4();



        const newMedia: Media = {
            id: newMediaId,
            publisher,
            type,
            title,
            description,
            url,
            duration,
            uploadDate: new Date(),
            isActive: true,
        };

        const newMediaDocRef = await addDoc(mediaRef, newMedia);

        const responseDto = new CreateMediaResponseDto(201, 'MEDIACREATEDSUCCESSFULLY');

        // Update cache with the newly created media
        const cachedMedia = await this.firebaseService.getCollectionData('media');
        cachedMedia.push({
            id: newMediaId,
            publisher,
            type,
            title,
            description,
            url,
            duration,
            uploadDate: newMedia.uploadDate.toISOString(),
            isActive: true,
        });
        this.firebaseService.setCollectionData('media', cachedMedia);
        console.log('Media added to the cache successfully.');

        return responseDto;
    }




    @ApiOperation({ summary: 'Update media information by id' })
    @ApiOkResponse({
        description: 'Media information has been successfully updated on Firestore.',
        type: UpdateMediaResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Media with the given URL does not exist' })
    async updateMedia(id: string, newData: Partial<UpdateMediaDto>): Promise<UpdateMediaResponseDto> {
        try {
            console.log('Initializing updateMedia...');
            const mediaCollectionRef = admin.firestore().collection('media');

            const querySnapshot = await mediaCollectionRef.where('id', '==', id).get();

            if (querySnapshot.empty) {
                console.log(`The media with the id "${id}" does not exist.`);
                throw new Error('MEDIADOESNOTEXIST.');
            }

            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, newData);
            });

            await batch.commit();
            console.log(`Updated info for media with id "${id}"`);


            const cachedCourses = await this.firebaseService.getCollectionData('media');
            const updatedCourseIndex = cachedCourses.findIndex((media) => media.id === id);
            if (updatedCourseIndex !== -1) {
                cachedCourses[updatedCourseIndex] = { ...cachedCourses[updatedCourseIndex], ...newData };
                this.firebaseService.setCollectionData('media', cachedCourses);
            }


            const response: UpdateMediaResponseDto = {
                statusCode: 200,
                message: 'MEDIAUPDATEDSUCCESSFULLY',
            };

            return response;
        } catch (error) {
            console.error('There was an error updating the media data:', error);
            throw error;
        }
    }




    @ApiOperation({ summary: 'Get media resources registered on Firestore' })
    @ApiOkResponse({
        description: 'Media resources have been successfully retrieved.',
        type: GetMediaResponseDto,
    })
    async getMedia(): Promise<GetMediaResponseDto> {
        try {
            console.log('Initializing getMedia...');

            // Tries to use data in cache if it exists
            const cachedMedia = await this.firebaseService.getCollectionData('media');
            if (cachedMedia.length > 0) {
                console.log('Using cached media data.');
                const activeMedia = cachedMedia.filter(media => media.isActive); 
                const getMediaDtoResponse: GetMediaResponseDto = {
                    statusCode: 200,
                    message: "MEDIAGOT",
                    mediaFound: activeMedia,
                };
                return getMediaDtoResponse;
            }

            // If there is no data, query Firestore
            const mediaRef = this.firebaseService.mediaCollection;
            const mediaQuery = query(mediaRef, where('isActive', '==', true), orderBy("title")); 
            console.log('Media query created.');

            const mediaQuerySnapshot = await getDocs(mediaQuery);
            console.log('Media query snapshot obtained.');

            const queryResult = [];
            mediaQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    publisher: data.publisher,
                    description: data.description,
                    duration: data.duration,
                    title: data.title,
                    type: data.type,
                    uploadDate: data.uploadDate,
                    url: data.url,
                    isActive: data.isActive,
                });
            });
            console.log('Media data collected.');

            // Save the data in cache for future queries
            this.firebaseService.setCollectionData('media', queryResult);

            const activeMedia = queryResult.filter(media => media.isActive);
            const getMediaDtoResponse: GetMediaResponseDto = {
                statusCode: 200,
                message: "MEDIAGOT",
                mediaFound: activeMedia,
            };
            console.log('Response created.');

            return getMediaDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the media.');
        }
    }





    //NOT IN USE
    @ApiOperation({ summary: 'Delete media by title and description' })
    @ApiOkResponse({
        description: 'Media has been successfully deleted.',
        type: DeleteMediaResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Media not found with the given title and description' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })

    async deleteMedia(title: string, description: string): Promise<DeleteMediaResponseDto> {
        try {
            const mediaCollectionRef = collection(this.firebaseService.fireStore, 'media');
            const mediaQuerySnapshot = await getDocs(query(mediaCollectionRef, where('title', '==', title)));
 
            if (mediaQuerySnapshot.empty) {
                console.log(`Media with title "${title}" not found in the media collection.`);
                throw new NotFoundException('MEDIANOTFOUND');
            }
            const mediaDoc = mediaQuerySnapshot.docs[0];

            const mediaData = mediaDoc.data() as Media;


            if (mediaData.description === description) {
                await deleteDoc(mediaDoc.ref);
            }
            else {
                console.log(`Media with description "${description}" not found in the media collection.`);
                throw new NotFoundException('MEDIANOTFOUND');
            }


            const cachedCourses = await this.firebaseService.getCollectionData('media');
            const indexToDelete = cachedCourses.findIndex((media) => media.title === title);

            if (indexToDelete !== -1) {
                cachedCourses.splice(indexToDelete, 1);
                this.firebaseService.setCollectionData('media', cachedCourses);
            }


            const response: DeleteMediaResponseDto = {
                statusCode: 200,
                message: 'MEDIADELETEDSUCCESSFULLY',
            };

            console.log(`Media with title "${title}" has been deleted successfully.`);
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }










    @ApiOperation({ summary: 'Get media resources by keywords on the title' })
    @ApiOkResponse({
        description: 'Media resources matching the keywords have been successfully retrieved.',
        type: GetMediaResponseDto,
    })
    async getMediaByKeywords(keywords: string[]): Promise<GetMediaResponseDto> {
        try {
            console.log('Initializing getMediaByKeywords...');

            // Tries to use data in cache if it exists
            const cachedMedia = await this.firebaseService.getCollectionData('media');
            if (cachedMedia.length > 0) {
                console.log('Using cached media data.');
                const activeMedia = cachedMedia.filter(media => media.isActive); 
                const matchedMedia = activeMedia.filter(media =>
                    keywords.some(keyword => media.title.toLowerCase().includes(keyword.toLowerCase()))
                );

                const responseDto: GetMediaResponseDto = {
                    statusCode: 200,
                    message: 'MEDIAGOT',
                    mediaFound: matchedMedia,
                };
                return responseDto;
            }

            // If there is no data in cache, query Firestore
            const mediaRef = this.firebaseService.mediaCollection;
            const mediaQuery = query(mediaRef, where('isActive', '==', true), orderBy('title'));
            console.log('Media query created.');

            const mediaQuerySnapshot = await getDocs(mediaQuery);
            console.log('Media query snapshot obtained.');

            const queryResult = [];
            mediaQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    publisher: data.publisher,
                    description: data.description,
                    duration: data.duration,
                    title: data.title,
                    type: data.type,
                    uploadDate: data.uploadDate,
                    url: data.url,
                    isActive: data.isActive,
                });
            });
            console.log('Media data collected.');

            // Filter the media by keywords
            const matchedMedia = queryResult.filter(media =>
                keywords.some(keyword => media.title.toLowerCase().includes(keyword.toLowerCase()))
            );

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('media', queryResult);

            const responseDto: GetMediaResponseDto = {
                statusCode: 200,
                message: 'MEDIAGOT',
                mediaFound: matchedMedia,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the media.');
        }
    }


  


    /*
    @ApiOperation({ summary: 'Upload media file to Datastorage' })
    @ApiCreatedResponse({
        description: 'Media file has been successfully uploaded.',
        type: UploadMediaResponseDto,
    })
    async uploadMediaFile(userEmail: string, file: any): Promise<UploadMediaResponseDto> {
        try {
            const mediaFileName = `${Date.now()}_${file.originalname}`;
            const mediaPath = `users/${userEmail}/media/${mediaFileName}`;

            console.log('Uploading file to:', mediaPath);

            const fileBucket = admin.storage().bucket();
            const uploadStream = fileBucket.file(mediaPath).createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            const readableStream = new Readable();
            readableStream._read = () => { };
            readableStream.push(file.buffer);
            readableStream.push(null);

            await new Promise<void>((resolve, reject) => {
                readableStream.pipe(uploadStream)
                    .on('error', (error) => {
                        console.error('Error uploading the file:', error);
                        reject(error);
                    })
                    .on('finish', () => {
                        console.log('File uploaded successfully.');
                        resolve();
                    });
            });

            const responseDto = new UploadMediaResponseDto(201, 'MEDIAUPLOADEDSUCCESSFULLY');
            return responseDto;
        } catch (error) {
            console.error('Error uploading the file:', error);
            throw new Error(`Error uploading the file: ${error.message}`);
        }
    }*/


    @ApiOperation({ summary: 'Upload media file to Datastorage and register it on Firestore' })
    @ApiBadRequestResponse({ description: 'Media title already exists' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async uploadAndCreateMedia(
        file: any,
        createNewMediaDto: CreateMediaDto
    ): Promise<UploadMediaResponseDto | CreateMediaResponseDto> {
        try {
           
            const newMediaId: string = uuidv4();


            const { type, title, description, url, duration, publisher } = createNewMediaDto;
            const mediaFileName = `${Date.now()}_${file.originalname}`;
            const mediaPath = `assets/${newMediaId}/${mediaFileName}`;

            console.log('Uploading file to:', mediaPath);


            const fileBucket = admin.storage().bucket();
            const uploadStream = fileBucket.file(mediaPath).createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            const readableStream = new Readable();
            readableStream._read = () => { };
            readableStream.push(file.buffer);
            readableStream.push(null);

            await new Promise<void>((resolve, reject) => {
                readableStream.pipe(uploadStream)
                    .on('error', (error) => {
                        console.error('Error uploading the file:', error);
                        reject(error);
                    })
                    .on('finish', () => {
                        console.log('File uploaded successfully.');
                        resolve();
                    });
            });

            const mediaRef = collection(this.firebaseService.fireStore, 'media');
            const mediaQuery = query(mediaRef);
            const mediaQuerySnapshot = await getDocs(mediaQuery);

          

            // Check if the title already exists in the collection
            const titleQuery = query(mediaRef, where('title', '==', title));
            const titleQuerySnapshot = await getDocs(titleQuery);

            if (!titleQuerySnapshot.empty) {
                throw new BadRequestException('TITLE ALREADY EXISTS');
            }




            const newMedia: Media = {
                id: newMediaId,
                publisher,
                type,
                title,
                description,
                url: mediaPath,
                duration,
                uploadDate: new Date(),
                isActive: true,
            };

            const newMediaDocRef = await addDoc(mediaRef, newMedia);

            const responseDto = new UploadMediaResponseDto(201, 'MEDIAUPLOADEDSUCCESSFULLY');

            // Update cache with the newly created media
            const cachedMedia = await this.firebaseService.getCollectionData('media');
            cachedMedia.push({
                id: newMediaId,
                publisher,
                type,
                title,
                description,
                url: mediaPath,
                duration,
                uploadDate: new Date(),
                isActive: true,
            });
            this.firebaseService.setCollectionData('media', cachedMedia);
            console.log('Media added to the cache successfully.');

            return responseDto;
        } catch (error) {
            console.error('Error uploading the file or creating media:', error);
            throw new Error(`Error uploading the file or creating media: ${error.message}`);
        }
    }









   


}
