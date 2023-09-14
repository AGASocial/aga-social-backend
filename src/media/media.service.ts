import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DocumentReference, DocumentSnapshot, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, collection, where, deleteDoc, QueryFieldFilterConstraint, addDoc, Timestamp } from 'firebase/firestore';
import * as admin from 'firebase-admin';
import { CreateMediaDto } from './dto/createMedia.dto';
import { CreateMediaResponseDto } from './dto/createMediaResponse.dto';
import { Media, MediaType } from './entities/media.entity';
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
import { convertFirestoreTimestamp } from '../utils/timeUtils.dto';
import { VimeoService } from '../vimeo/vimeo.service';
import { GetMediaByIdResponseDto } from './dto/getMediaByIdResponse.dto';




@Injectable()
export class MediaService {

    constructor(private firebaseService: FirebaseService, private vimeoService: VimeoService) { }



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
            active: true,
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
            active: true,
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
                const activeMedia = cachedMedia.filter(media => media.active);

                // Convert uploadDate in cached media using the imported function
                const activeMediaWithFormattedDates = activeMedia.map(media => ({
                    ...media,
                    uploadDate: convertFirestoreTimestamp(media.uploadDate),
                }));

                const getMediaDtoResponse: GetMediaResponseDto = {
                    statusCode: 200,
                    message: "MEDIAGOT",
                    mediaFound: activeMediaWithFormattedDates,
                };
                return getMediaDtoResponse;
            }

            // If there is no data, query Firestore
            const mediaRef = this.firebaseService.mediaCollection;
            const mediaQuery = query(mediaRef, where('active', '==', true));
            console.log('Media query created.');

            const mediaQuerySnapshot = await getDocs(mediaQuery);
            console.log('Media query snapshot obtained.');

            const queryResult = [];
            mediaQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.isActive) {
                    const uploadTimestamp: Timestamp = data.uploadDate;
                    const uploadDate = convertFirestoreTimestamp(uploadTimestamp);
                    queryResult.push({
                        publisher: data.publisher,
                        description: data.description,
                        duration: data.duration,
                        title: data.title,
                        type: data.type,
                        uploadDate: uploadDate,
                        url: data.url,
                        active: data.active,
                    });
                }
            });
            console.log('Media data collected.');

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('media', queryResult);

            const activeMedia = queryResult.filter(media => media.isActive);
            const activeMediaWithFormattedDates = activeMedia.map(media => ({
                ...media,
                uploadDate: convertFirestoreTimestamp(media.uploadDate),
            }));

            const getMediaDtoResponse: GetMediaResponseDto = {
                statusCode: 200,
                message: "MEDIAGOT",
                mediaFound: activeMediaWithFormattedDates,
            };
            console.log('Response created.');

            return getMediaDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the media.');
        }
    }






    @ApiOperation({ summary: 'Get media resources by keywords on the title' })
    @ApiOkResponse({
        description: 'Media resources matching the keywords have been successfully retrieved.',
        type: GetMediaResponseDto,
    })
    async getMediaByKeywords(keywords: string[] | string): Promise<GetMediaResponseDto> {
        try {
            console.log('Initializing getMediaByKeywords...');

            if (typeof keywords === 'string') {
                keywords = [keywords];
            }

            // Tries to use data in cache if it exists
            const cachedMedia = await this.firebaseService.getCollectionData('media');
            if (cachedMedia.length > 0) {
                console.log('Using cached media data.');
                const matchedMedia = cachedMedia.filter(media =>
                    media.active && this.mediaMatchesKeywords(media, keywords)
                );

                const matchedMediaWithFormattedDates = matchedMedia.map(media => ({
                    ...media,
                    uploadDate: convertFirestoreTimestamp(media.uploadDate),
                }));

                const responseDto: GetMediaResponseDto = {
                    statusCode: 200,
                    message: 'MEDIAGOT',
                    mediaFound: matchedMediaWithFormattedDates,
                };
                return responseDto;
            }

            // If there is no data in cache, query Firestore
            const mediaRef = this.firebaseService.mediaCollection;
            const mediaQuery = query(mediaRef, where('active', '==', true));
            console.log('Media query created.');

            const mediaQuerySnapshot = await getDocs(mediaQuery);
            console.log('Media query snapshot obtained.');

            const queryResult = [];
            mediaQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.active) {
                    const uploadTimestamp: Timestamp = data.uploadDate;
                    const uploadDate = convertFirestoreTimestamp(uploadTimestamp);
                    queryResult.push({
                        publisher: data.publisher,
                        description: data.description,
                        duration: data.duration,
                        title: data.title,
                        type: data.type,
                        uploadDate: uploadDate,
                        url: data.url,
                        active: data.active,
                    });
                }
            });
            console.log('Media data collected.');

            // Filter the media by keywords using the helper function
            const matchedMedia = queryResult.filter(media =>
                this.mediaMatchesKeywords(media, keywords)
            );

            const matchedMediaWithFormattedDates = matchedMedia.map(media => ({
                ...media,
                uploadDate: convertFirestoreTimestamp(media.uploadDate),
            }));

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('media', queryResult);

            const responseDto: GetMediaResponseDto = {
                statusCode: 200,
                message: 'MEDIAGOT',
                mediaFound: matchedMediaWithFormattedDates,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the media.');
        }
    }

    private mediaMatchesKeywords(media: Media, keywords: string[] | string): boolean {
        if (typeof keywords === 'string') {
            keywords = [keywords];
        }

        const lowerCaseTitle = media.title.toLowerCase();
        return keywords.every(keyword => lowerCaseTitle.includes(keyword.toLowerCase()));
    }





    @ApiOperation({ summary: 'Upload media file to Datastorage and register it on Firestore' })
    @ApiBadRequestResponse({ description: 'Media title already exists' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async uploadAndCreateMedia(
        file: any,
        createNewMediaDto: CreateMediaDto
    ): Promise<UploadMediaResponseDto | CreateMediaResponseDto> {
        try {

            const maxFileSize = 150 * 1024 * 1024; // 150 MB

            if (file.size > maxFileSize) {
                return {
                    statusCode: 400,
                    message: 'Max size for the file exceeded',
                };
            }



            const newMediaId: string = uuidv4();


            const { type, title, description, duration, publisher } = createNewMediaDto;
            const mediaFileName = `${Date.now()}_${file.originalname}`;
            const mediaPath = `assets/${newMediaId}/${mediaFileName}`;

            //Upload media to Vimeo
            let mediaLink;

            if (type === 'video') {
                mediaLink = await this.vimeoService.uploadVideo(file.buffer, title);
            }




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

            const [url] = await fileBucket.file(mediaPath).getSignedUrl({
                action: 'read',
                expires: '01-01-2100', 
            });

            const mediaRef = collection(this.firebaseService.fireStore, 'media');
            const mediaQuery = query(mediaRef);
            const mediaQuerySnapshot = await getDocs(mediaQuery);

          





            const newMedia: Media = {
                id: newMediaId,
                publisher,
                type,
                title,
                description,
                url,
                duration,
                uploadDate: new Date(),
                active: true,
                vimeoVideo: type === 'video' ? mediaLink : '',            };
            const newMediaDocRef = await addDoc(mediaRef, newMedia);

            const responseDto = new UploadMediaResponseDto(201, 'MEDIAUPLOADEDSUCCESSFULLY', newMediaId);

          


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
                active: true,
                vimeoVideo: mediaLink,

            });
            this.firebaseService.setCollectionData('media', cachedMedia);
            console.log('Media added to the cache successfully.');

            return responseDto;
        } catch (error) {
            console.error('Error uploading the file or creating media:', error);
            throw new Error(`Error uploading the file or creating media: ${error.message}`);
        }
    }




    @ApiOperation({ summary: 'Register media file on Firestore. The media already exists on Youtube or Vimeo' })
    @ApiBadRequestResponse({ description: 'Invalid parameter/s' })
    async registerMedia(
        type: MediaType,
        title: string,
        description: string,
        duration: string,
        publisher: string,
        url: string,
        uploadDate: Date,
    ): Promise<UploadMediaResponseDto> {
        try {
            const mediaRef = collection(this.firebaseService.fireStore, 'media');
            const newMediaId: string = uuidv4();

            const newMedia: Media = {
                id: newMediaId,
                publisher,
                type,
                title,
                description,
                url,
                duration,
                uploadDate,
                active: true,
            };

            await addDoc(mediaRef, newMedia);

            const responseDto = new UploadMediaResponseDto(201, 'MEDIAUPLOADEDSUCCESSFULLY', newMediaId);

            // Update cache with the newly created media
            const cachedMedia = await this.firebaseService.getCollectionData('media');
            cachedMedia.push(newMedia);
            this.firebaseService.setCollectionData('media', cachedMedia);
            console.log('Media added to the cache successfully.');

            return responseDto;
        } catch (error) {
            console.error('Error uploading the file or creating media:', error);
            throw new Error(`Error uploading the file or creating media: ${error.message}`);
        }
    }





    @ApiOperation({ summary: 'Get a specific media resource from Firestore by ID' })
    @ApiOkResponse({ description: 'Media resource retrieved successfully', type: GetMediaByIdResponseDto })
    @ApiNotFoundResponse({ description: 'Media resource not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getMediaById(mediaId: string): Promise<GetMediaByIdResponseDto> {
        try {
            const mediaRef = this.firebaseService.mediaCollection;
            const mediaQuery = query(mediaRef, where("id", "==", mediaId));

            const mediaQuerySnapshot = await getDocs(mediaQuery);

            if (!mediaQuerySnapshot.empty) {
                const mediaDocSnapshot = mediaQuerySnapshot.docs[0];

                const mediaData = mediaDocSnapshot.data();
                const uploadTimestamp: Timestamp = mediaData.uploadDate;


                const mediaFound: Media = {
                    publisher: mediaData.publisher,
                    description: mediaData.description,
                    duration: mediaData.duration,
                    title: mediaData.title,
                    type: mediaData.type,
                    uploadDate: uploadTimestamp.toDate(), 
                    url: mediaData.url,
                    active: mediaData.active,
                };

                const mediaResponse: GetMediaByIdResponseDto = {
                    statusCode: 200,
                    message: "MEDIARETRIEVEDSUCCESSFULLY",
                    mediaFound: mediaFound,
                };

                return mediaResponse;
            } else {
                throw new Error(`Media resource with ID ${mediaId} not found.`);
            }
        } catch (error) {
            throw new Error('There was an error retrieving the media resource by ID.');
        }
    }




   


}
