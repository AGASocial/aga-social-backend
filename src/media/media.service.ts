import { Injectable } from '@nestjs/common';
import { DocumentReference, DocumentSnapshot, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, collection, where, deleteDoc, QueryFieldFilterConstraint, addDoc, Timestamp } from 'firebase/firestore';
import * as admin from 'firebase-admin';
import { CreateMediaDto } from './dto/createMedia.dto';
import { CreateMediaResponseDto } from './dto/createMediaResponse.dto';
import { Media, MediaType } from './entities/media.entity';
import { UpdateMediaDto } from './dto/updateMedia.dto';
import { UpdateMediaResponseDto } from './dto/updateMediaResponse.dto';
import { GetMediaResponseDto } from './dto/getMediaResponse.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { UploadMediaResponseDto } from './dto/uploadMediaFileResponse.dto';
import { convertFirestoreTimestamp } from '../utils/timeUtils.dto';
import { VimeoService } from '../vimeo/vimeo.service';
import { GetMediaByIdResponseDto } from './dto/getMediaByIdResponse.dto';




@Injectable()
export class MediaService {

    constructor(private firebaseService: FirebaseService, private vimeoService: VimeoService) { }





    async createNewMedia(createNewMediaDto: CreateMediaDto): Promise<CreateMediaResponseDto> {
        try {
            const { type, title, description, url, duration, publisher } = createNewMediaDto;
            const mediaRef = collection(this.firebaseService.fireStore, 'media');

            const customMediaWhere: QueryFieldFilterConstraint = where('url', '==', url);
            const mediaQuery = query(mediaRef, customMediaWhere);
            const mediaQuerySnapshot = await getDocs(mediaQuery);

            if (!mediaQuerySnapshot.empty) {
                const responseDto = new CreateMediaResponseDto('error', 400, 'Media with the same URL already exists.', {});
                return responseDto;
            }

            const newMedia: Media = {
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

            const newMediaId = newMediaDocRef.id;

            await updateDoc(doc(this.firebaseService.fireStore, 'media', newMediaId), { id: newMediaId });

            const responseDto = new CreateMediaResponseDto('success', 201, 'Media created successfully.', { mediaId: newMediaId });

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
        } catch (error) {
            console.error('Error creating media:', error);
            const responseDto = new CreateMediaResponseDto('error', 400, 'Media could not be created, bad request.', {});
            return responseDto
        }
    }



  
    async updateMedia(id: string, newData: Partial<UpdateMediaDto>): Promise<UpdateMediaResponseDto> {
        try {
            const mediaCollectionRef = admin.firestore().collection('media');
            const querySnapshot = await mediaCollectionRef.where('id', '==', id).get();

            if (querySnapshot.empty) {
                const response: UpdateMediaResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'The media does not exist.',
                    data: {
                        result: {},
                    },
                };
                return response;
            }

            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, newData);
            });

            await batch.commit();
            console.log(`Updated info for media with id "${id}"`);

            const cachedMedia = await this.firebaseService.getCollectionData('media');
            const updatedMediaIndex = cachedMedia.findIndex((media) => media.id === id);
            if (updatedMediaIndex !== -1) {
                cachedMedia[updatedMediaIndex] = { ...cachedMedia[updatedMediaIndex], ...newData };
                this.firebaseService.setCollectionData('media', cachedMedia);
            }

            const response: UpdateMediaResponseDto = {
                status: 'success',
                code: 200,
                message: 'Media updated successfully.',
                data: {
                    result: {},
                },
            };

            return response;
        } catch (error) {
            console.error('There was an error updating the media data:', error);
            const response: UpdateMediaResponseDto = {
                status: 'error',
                code: 400,
                message: 'There was an error updating the media data.',
                data: {
                    result: {},
                },
            };

            return response;
        }
    }



    async getMedia(): Promise<GetMediaResponseDto> {
        try {
            console.log('Initializing getMedia...');

            const cachedMedia = await this.firebaseService.getCollectionData('media');

            if (cachedMedia.length > 0) {
                console.log('Using cached media data.');

                const activeMedia = cachedMedia.filter(media => media.active);
                const activeMediaWithFormattedDates = activeMedia.map(media => ({
                    ...media,
                    uploadDate: convertFirestoreTimestamp(media.uploadDate),
                }));

                const getMediaDtoResponse: GetMediaResponseDto = {
                    status: 'success',
                    code: 200,
                    message: 'Media retrieved successfully.',
                    data: {
                        result: activeMediaWithFormattedDates,
                    },
                };
                return getMediaDtoResponse;
            }

            const mediaRef = this.firebaseService.mediaCollection;
            const mediaQuery = query(mediaRef, where('active', '==', true));
            console.log('Media query created.');

            const mediaQuerySnapshot = await getDocs(mediaQuery);
            console.log('Media query snapshot obtained.');

            const queryResult = [];

            mediaQuerySnapshot.forEach((doc) => {
                const data = doc.data();
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
            });


            await this.firebaseService.setCollectionData('media', queryResult);

            const activeMedia = queryResult.filter(media => media.active);
            const activeMediaWithFormattedDates = activeMedia.map(media => ({
                ...media,
                uploadDate: convertFirestoreTimestamp(media.uploadDate),
            }));

            const getMediaDtoResponse: GetMediaResponseDto = {
                status: 'success',
                code: 200,
                message: 'Media retrieved successfully.',
                data: {
                    result: activeMediaWithFormattedDates,
                },
            };

            return getMediaDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            const getMediaDtoResponse: GetMediaResponseDto = {
                status: 'error',
                code: 400,
                message: 'Media could not be retrieved.',
                data: {
                    result: {}
                },
            };

            return getMediaDtoResponse;
        }
    }


    async getMediaByKeywords(keywords: string[] | string): Promise<GetMediaResponseDto> {
        try {
            console.log('Initializing getMediaByKeywords...');

            if (typeof keywords === 'string') {
                keywords = [keywords];
            }

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
                    status: 'success',
                    code: matchedMedia.length > 0 ? 200 : 404,
                    message: matchedMedia.length > 0 ? 'Media retrieved successfully.' : 'No matching media found.',
                    data: {
                        result: matchedMediaWithFormattedDates,
                    },
                };
                return responseDto;
            }

            const mediaRef = this.firebaseService.mediaCollection;
            const mediaQuery = query(mediaRef, where('active', '==', true));
            console.log('Media query created.');

            const mediaQuerySnapshot = await getDocs(mediaQuery);

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

            const matchedMedia = queryResult.filter(media =>
                this.mediaMatchesKeywords(media, keywords)
            );

            const matchedMediaWithFormattedDates = matchedMedia.map(media => ({
                ...media,
                uploadDate: convertFirestoreTimestamp(media.uploadDate),
            }));

            await this.firebaseService.setCollectionData('media', queryResult);

            const responseDto: GetMediaResponseDto = {
                status: 'success',
                code: matchedMedia.length > 0 ? 200 : 404,
                message: matchedMedia.length > 0 ? 'Media retrieved successfully.' : 'No matching media found.',
                data: {
                    result: matchedMediaWithFormattedDates,
                },
            };

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            const responseDto: GetMediaResponseDto = {
                status: 'error',
                code: 400,
                message: 'Media could not be retrieved.',
                data: {
                    result: {}
                },
            };

            return responseDto;
        }
    }

    private mediaMatchesKeywords(media: Media, keywords: string[] | string): boolean {
        if (typeof keywords === 'string') {
            keywords = [keywords];
        }

        const lowerCaseTitle = media.title.toLowerCase();
        return keywords.every(keyword => lowerCaseTitle.includes(keyword.toLowerCase()));
    }





    
    async uploadAndCreateMedia(
        file: any,
        createNewMediaDto: CreateMediaDto
    ): Promise<CreateMediaResponseDto> {
        try {
            const maxFileSize = 400 * 1024 * 1024; // 400 MB

            if (file.size > maxFileSize) {
                return {
                    status: 'error',
                    code: 400,
                    message: 'Max size for the file exceeded',
                    data: {
                        result: {},
                    },
                };
            }

            const { type, title, description, duration, publisher } = createNewMediaDto;

            const mediaRef = collection(this.firebaseService.fireStore, 'media');
            const mediaQuery = query(mediaRef, where('url', '==', file.originalname));
            const mediaQuerySnapshot = await getDocs(mediaQuery);

            if (!mediaQuerySnapshot.empty) {
                return {
                    status: 'error',
                    code: 400,
                    message: 'Media with the same URL already exists',
                    data: {
                        result: {},
                    },
                };
            }

            const newMedia: Media = {
                publisher,
                type,
                title,
                description,
                url: file.originalname,
                duration,
                uploadDate: new Date(),
                active: true,
                vimeoVideo: '',
            };

            const newMediaDocRef = await addDoc(mediaRef, newMedia);

            const newMediaId = newMediaDocRef.id;

            let mediaLink = '';
            if (type === 'video') {
                mediaLink = await this.vimeoService.uploadVideo(file.buffer, title);
            }

            const updatedMedia = {
                ...newMedia,
                id: newMediaId,
            };

            await updateDoc(doc(mediaRef, newMediaId), updatedMedia);

            const responseDto = new CreateMediaResponseDto('success', 201, 'Media uploaded successfully.', {
                mediaId: newMediaId,
                vimeoVideo: mediaLink,
            });

            const cachedMedia = await this.firebaseService.getCollectionData('media');
            cachedMedia.push({
                id: newMediaId,
                publisher,
                type,
                title,
                description,
                url: file.originalname,
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
            const responseDto = new CreateMediaResponseDto('error', 400, 'Error uploading media.', {
                result: {},
            });
            return responseDto;
        }
    }





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

            const customMediaWhere = where('url', '==', url);
            const mediaQuery = query(mediaRef, customMediaWhere);
            const mediaQuerySnapshot = await getDocs(mediaQuery);

            if (!mediaQuerySnapshot.empty) {
                return {
                    status: 'error',
                    code: 400,
                    message: 'Media with the same URL already exists',
                    data: {
                        result: {},
                    },
                };
            }


            console.log('Received values:');
            console.log('Type:', type);
            console.log('Title:', title);
            console.log('Description:', description);
            console.log('Duration:', duration);
            console.log('Publisher:', publisher);
            console.log('URL:', url);
            console.log('Upload Date:', uploadDate);


            const newMediaDocRef = await addDoc(mediaRef, {
                publisher,
                type,
                title,
                description,
                url,
                duration,
                uploadDate,
                active: true,
            });

            const newMediaId = newMediaDocRef.id;

            await updateDoc(newMediaDocRef, { id: newMediaId });

            const responseDto = new UploadMediaResponseDto('success', 201, 'Media uploaded successfully.', {
                mediaId: newMediaId,
                url: url,
            });

            const cachedMedia = await this.firebaseService.getCollectionData('media');
            cachedMedia.push({
                id: newMediaId,
                publisher,
                type,
                title,
                description,
                url,
                duration,
                uploadDate,
                active: true,
            });
            this.firebaseService.setCollectionData('media', cachedMedia);

            return responseDto;
        } catch (error) {
            console.error('Error uploading the file or creating media:', error);
            const responseDto = new UploadMediaResponseDto('error', 400, 'Media could not be uploaded', {
               
            });
            return responseDto;

        }
    }




    async getMediaById(mediaId: string): Promise<GetMediaByIdResponseDto> {
        try {
            const mediaRef = this.firebaseService.mediaCollection;
            const mediaQuery = query(mediaRef, where('id', '==', mediaId));

            const mediaQuerySnapshot = await getDocs(mediaQuery);

            if (!mediaQuerySnapshot.empty) {
                const mediaDocSnapshot = mediaQuerySnapshot.docs[0];

                const mediaData = mediaDocSnapshot.data();
              //  const uploadTimestamp: Timestamp = mediaData.uploadDate;

                const mediaFound: Media = {
                    publisher: mediaData.publisher,
                    description: mediaData.description,
                    duration: mediaData.duration,
                    title: mediaData.title,
                    type: mediaData.type,
                    uploadDate: mediaData.uploadDate,
                    url: mediaData.url,
                    active: mediaData.active,
                    vimeoVideo: mediaData.vimeoVideo,
                };

                const mediaResponse: GetMediaByIdResponseDto = {
                    status: 'success',
                    code: 200,
                    message: 'Media retrieved successfully.',
                    data: {
                        result: mediaFound,
                    },
                };

                return mediaResponse;
            } else {
                const mediaResponse: GetMediaByIdResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Media does not exist.',
                    data: {
                        result: {},
                    },
                };

                return mediaResponse;
            }
        } catch (error) {
            console.error('Error retrieving media by ID:', error);
            const mediaResponse: GetMediaByIdResponseDto = {
                status: 'error',
                code: 400,
                message: 'Media could not be retrieved.',
                data: {
                    result: {},
                },
            };

            return mediaResponse;
        }
    }


   


}
