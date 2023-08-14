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



@Injectable()
export class MediaService {

    constructor(private firebaseService: FirebaseService) { }


    async createNewMedia(createNewMediaDto: CreateMediaDto): Promise<CreateMediaResponseDto> {
        const newMediaData = {
            type: createNewMediaDto.type,
            title: createNewMediaDto.title,
            description: createNewMediaDto.description,
            url: createNewMediaDto.url,
            duration: createNewMediaDto.duration,
            uploadDate: createNewMediaDto.uploadDate,
        };

        const { type, title, description, url, duration, uploadDate } = createNewMediaDto;
        const mediaRef = collection(this.firebaseService.fireStore, 'media');

        const customMediaWhere: QueryFieldFilterConstraint = where('url', '==', url);
        const mediaQuery = query(mediaRef, customMediaWhere);
        const mediaQuerySnapshot = await getDocs(mediaQuery);

        if (!mediaQuerySnapshot.empty) {
            throw new BadRequestException('URL ALREADY EXISTS');
        }

        const newMedia: Media = {
            type: type,
            title: title,
            description: description,
            url: url,
            duration: duration,
            uploadDate: uploadDate,
        };

        const newMediaDocRef = await addDoc(mediaRef, newMedia);
        const newMediaId = newMediaDocRef.id;


        const cachedCourses = await this.firebaseService.getCollectionData('media');
        cachedCourses.push({
            type,
            title,
            description,
            url,
            duration,
            uploadDate,
        });
        this.firebaseService.setCollectionData('media', cachedCourses);
        console.log('Media added to the cache successfully.');



        const responseDto = new CreateMediaResponseDto(201, 'MEDIACREATEDSUCCESSFULLY');
        return responseDto;
    }

    async updateMedia(url: string, newData: Partial<UpdateMediaDto>): Promise<UpdateMediaResponseDto> {
        try {
            console.log('Initializing updateMedia...');
            const mediaCollectionRef = admin.firestore().collection('media');

            const querySnapshot = await mediaCollectionRef.where('url', '==', url).get();

            if (querySnapshot.empty) {
                console.log(`The media with the url "${url}" does not exist.`);
                throw new Error('MEDIADOESNOTEXIST.');
            }

            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, newData);
            });

            await batch.commit();
            console.log(`Updated info for media with url "${url}"`);


            const cachedCourses = await this.firebaseService.getCollectionData('media');
            const updatedCourseIndex = cachedCourses.findIndex((media) => media.url === url);
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



    async getMedia(): Promise<GetMediaResponseDto> {
        try {
            console.log('Initializing getMedia...');

            // Tries to use data in cache if it exists
            const cachedMedia = await this.firebaseService.getCollectionData('media');
            if (cachedMedia.length > 0) {
                console.log('Using cached media data.');
                const getMediaDtoResponse: GetMediaResponseDto = {
                    statusCode: 200,
                    message: "MEDIAGOT",
                    mediaFound: cachedMedia,
                };
                return getMediaDtoResponse;
            }

            // If there is no data, it uses firestore instead
            const mediaRef = this.firebaseService.mediaCollection;
            const mediaQuery = query(mediaRef, orderBy("title"));
            console.log('Media query created.');

            const mediaQuerySnapshot = await getDocs(mediaQuery);
            console.log('Media query snapshot obtained.');

            let queryResult = [];
            mediaQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    description: data.description,
                    duration: data.duration,
                    title: data.title,
                    type: data.type,
                    uploadDate: data.uploadDate,
                    url: data.url
                });
            });
            console.log('Media data collected.');

            // the data is saved in cache for future queries
            this.firebaseService.setCollectionData('media', queryResult);

            const getMediaDtoResponse: GetMediaResponseDto = {
                statusCode: 200,
                message: "MEDIAGOT",
                mediaFound: queryResult,
            };
            console.log('Response created.');

            return getMediaDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the media.');
        }
    }





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


    async getMediaByKeywords(keywords: string[]): Promise<GetMediaResponseDto> {
        try {
            console.log('Initializing getMediaByKeywords...');

            // Tries to use data in cache if it exists
            const cachedMedia = await this.firebaseService.getCollectionData('media');
            if (cachedMedia.length > 0) {
                console.log('Using cached media data.');
                const matchedMedia = cachedMedia.filter(media =>
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
            const mediaQuery = query(mediaRef, orderBy('title'));
            console.log('Media query created.');

            const mediaQuerySnapshot = await getDocs(mediaQuery);
            console.log('Media query snapshot obtained.');

            const queryResult = [];
            mediaQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    description: data.description,
                    duration: data.duration,
                    title: data.title,
                    type: data.type,
                    uploadDate: data.uploadDate,
                    url: data.url,
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



}
