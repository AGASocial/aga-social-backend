import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DocumentReference, DocumentSnapshot, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, collection, where, deleteDoc, QueryFieldFilterConstraint, addDoc } from 'firebase/firestore';
import { FirebaseService } from 'src/firebase/firebase.service';
import { DocResult } from 'src/utils/docResult.entity';
import * as admin from 'firebase-admin';
import { CreateMediaDto } from './dto/createMedia.dto';
import { CreateMediaResponseDto } from './dto/createMediaResponse.dto';
import { Media } from './entities/media.entity';
import { MediaType } from 'src/media/entities/media.entity'
import { UpdateMediaDto } from './dto/updateMedia.dto';
import { UpdateMediaResponseDto } from './dto/updateMediaResponse.dto';
import { GetMediaResponseDto } from './dto/getMediaResponse.dto';
import { DeleteMediaResponseDto } from './dto/deleteMediaResponse.dto';



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

            // Retornar la respuesta con el código de estado y el mensaje
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

            const getRolesDtoResponse: GetMediaResponseDto = {
                statusCode: 200,
                message: "MEDIAGOT",
                mediaFound: queryResult,
            };
            console.log('Response created.');

            return getRolesDtoResponse;
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


}
