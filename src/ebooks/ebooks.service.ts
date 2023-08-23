import * as admin from 'firebase-admin';
import { Ebook, EbookFormat } from './entities/ebooks.entity';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateEbookDto } from './dto/createEbook.dto';
import { CreateEbookResponseDto } from './dto/createEbookResponse.dto';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, QueryFieldFilterConstraint, updateDoc, where } from 'firebase/firestore';
import { UpdateMediaDto } from '../media/dto/updateMedia.dto';
import { UpdateMediaResponseDto } from '../media/dto/updateMediaResponse.dto';
import { DeleteEbookResponseDto } from './dto/deleteEbookResponse.dto';
import { GetEbooksResponseDto } from './dto/getEbooksResponse.dto';
import { UploadEbookResponseDto } from './dto/uploadEbookResponse.dto';
import { Readable } from 'stream';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { UpdateEbookResponseDto } from './dto/updateEbookResponse.dto';
import { UpdateEbookDto } from './dto/updateEbook.dto';


@Injectable()
export class EbookService {

    constructor(private firebaseService: FirebaseService) { }



    @ApiOperation({ summary: 'Create an ebook on firestore' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async createNewEbook(createNewEbookDto: CreateEbookDto): Promise<CreateEbookResponseDto> {
    

        const { title, description, url, titlePage, author, releaseDate, price, language, pageCount, genres, format, publisher } = createNewEbookDto;
        const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');

        const customEbookWhere: QueryFieldFilterConstraint = where('url', '==', url);
        const ebookQuery = query(ebookRef, customEbookWhere);
        const ebookQuerySnapshot = await getDocs(ebookQuery);

        if (!ebookQuerySnapshot.empty) {
            throw new BadRequestException('URL ALREADY EXISTS');
        }


        // Check if the title already exists in the collection
        const titleQuery = query(ebookRef, where('title', '==', title));
        const titleQuerySnapshot = await getDocs(titleQuery);

        if (!titleQuerySnapshot.empty) {
            throw new BadRequestException('TITLE ALREADY EXISTS');
        }



        const userRef = collection(this.firebaseService.fireStore, 'users');
        const userQuery = query(userRef, where('username', '==', publisher));
        const userQuerySnapshot = await getDocs(userQuery);

        if (userQuerySnapshot.empty) {
            throw new BadRequestException('PUBLISHER NOT FOUND. ENTER THE USERNAME OF A REGISTERED USER');
        }

        const newEbookId: string = uuidv4();

        const newEbook: Ebook = {
            id: newEbookId,
            title: title,
            publisher: publisher,
            description: description,
            url: url,
            titlePage: titlePage,
            author: author,
            releaseDate: releaseDate,
            price: price,
            language: language,
            pageCount: pageCount,
            genres: genres,
            format: format,
            salesCount: 0,
            isActive: true,

        };

        const newEbookDocRef = await addDoc(ebookRef, newEbook);
        const newEbookId2 = newEbookDocRef.id;


        const cachedCourses = await this.firebaseService.getCollectionData('ebooks');
        cachedCourses.push({
            id: newEbookId,
            title,
            publisher,
            description,
            url,
            author,
            releaseDate,
            price,
            language,
            pageCount,
            genres,
            format,
            salesCount: 0,
            isActive: true,
            titlePage,

        });
        this.firebaseService.setCollectionData('ebooks', cachedCourses);
        console.log('Ebook added to the cache successfully.');



        const responseDto = new CreateEbookResponseDto(201, 'EBOOKCREATEDSUCCESSFULLY');
        return responseDto;
    }



    @ApiOperation({ summary: 'Update ebook data' })
    @ApiParam({ name: 'title', description: 'Title of the ebook to update' })
    @ApiParam({ name: 'newData', description: 'Partial data to update in the ebook' })
    @ApiNotFoundResponse({ description: 'Ebook not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async updateEbook(id: string, newData: Partial<UpdateEbookDto>): Promise<UpdateEbookResponseDto> {
        try {
            console.log('Initializing updateEbook...');
            const ebooksCollectionRef = admin.firestore().collection('ebooks');

            const querySnapshot = await ebooksCollectionRef.where('id', '==', id).get();

            if (querySnapshot.empty) {
                console.log(`The ebook with the id "${id}" does not exist.`);
                throw new Error('EBOOKDOESNOTEXIST.');
            }

            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, newData);
            });

            await batch.commit();
            console.log(`Updated info for ebook with id "${id}"`);

            const cachedCourses = await this.firebaseService.getCollectionData('ebooks');
            const updatedCourseIndex = cachedCourses.findIndex((ebook) => ebook.id === id);
            if (updatedCourseIndex !== -1) {
                cachedCourses[updatedCourseIndex] = { ...cachedCourses[updatedCourseIndex], ...newData };
                this.firebaseService.setCollectionData('ebooks', cachedCourses);
            }


            const response: UpdateEbookResponseDto = {
                statusCode: 200,
                message: 'EBOOKUPDATEDSUCCESSFULLY',
            };

            return response;
        } catch (error) {
            console.error('There was an error updating the ebook data:', error);
            throw error;
        }
    }

    


   


    @ApiOperation({ summary: 'Get all active ebooks from Firestore' })
    @ApiOkResponse({ description: 'Ebooks retrieved successfully', type: GetEbooksResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getEbooks(): Promise<GetEbooksResponseDto> {
        try {
            console.log('Initializing getEbooks...');

            // Tries to use data in cache if it exists
            const cachedEbooks = await this.firebaseService.getCollectionData('ebooks');
            if (cachedEbooks.length > 0) {
                console.log('Using cached ebooks data.');
                const activeEbooks = cachedEbooks.filter(ebook => ebook.isActive); 
                const getEbooksDtoResponse: GetEbooksResponseDto = {
                    statusCode: 200,
                    message: "EBOOKSGOT",
                    ebooksFound: activeEbooks,
                };
                return getEbooksDtoResponse;
            }

            // If there is no data, it uses firestore instead
            const ebooksRef = this.firebaseService.ebooksCollection;
            const ebooksQuery = query(ebooksRef, where("isActive", "==", true), orderBy("title")); 
            console.log('Ebooks query created.');

            const ebooksQuerySnapshot = await getDocs(ebooksQuery);
            console.log('Ebooks query snapshot obtained.');

            const queryResult = [];
            ebooksQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    title: data.title,
                    publisher: data.publisher,
                    author: data.author,
                    description: data.description,
                    titlePage: data.titlePage,
                    url: data.url,
                    releaseDate: data.releaseDate,
                    price: data.price,
                    language: data.language,
                    pageCount: data.pageCount,
                    genres: data.genres,
                    format: data.format,
                    salesCount: data.salesCount,
                    isActive: data.isActive,
                });
            });
            console.log('Ebook data collected.');

            // the data is saved in cache for future queries
            this.firebaseService.setCollectionData('ebooks', queryResult);

            const getEbooksDtoResponse: GetEbooksResponseDto = {
                statusCode: 200,
                message: "EBOOKSGOT",
                ebooksFound: queryResult,
            };
            console.log('Response created.');

            return getEbooksDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the ebooks.');
        }
    }





    @ApiOperation({ summary: 'Get ebooks by keywords on the title' })
    @ApiParam({ name: 'keywords', description: 'Keywords for filtering ebooks' })
    @ApiOkResponse({ description: 'Ebooks retrieved successfully', type: GetEbooksResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getEbooksByKeywords(keywords: string[]): Promise<GetEbooksResponseDto> {
        try {
            console.log('Initializing getEbooksByKeywords...');

            // Tries to use data in cache if it exists
            const cachedEbooks = await this.firebaseService.getCollectionData('ebooks');
            if (cachedEbooks.length > 0) {
                console.log('Using cached ebooks data.');
                const matchedEbooks = cachedEbooks.filter(ebook =>
                    ebook.isActive && keywords.some(keyword => ebook.title.toLowerCase().includes(keyword.toLowerCase()))
                );

                const responseDto: GetEbooksResponseDto = {
                    statusCode: 200,
                    message: 'EBOOKSGOT',
                    ebooksFound: matchedEbooks,
                };
                return responseDto;
            }

            // If there is no data in cache, query Firestore
            const ebooksRef = this.firebaseService.ebooksCollection;
            const ebooksQuery = query(ebooksRef, orderBy('title'));
            console.log('Ebooks query created.');

            const ebooksQuerySnapshot = await getDocs(ebooksQuery);
            console.log('Ebooks query snapshot obtained.');

            const queryResult = [];
            ebooksQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    title: data.title,
                    publisher: data.publisher,
                    author: data.author,
                    description: data.description,
                    titlePage: data.titlePage,
                    url: data.url,
                    releaseDate: data.releaseDate,
                    price: data.price,
                    language: data.language,
                    pageCount: data.pageCount,
                    genres: data.genres,
                    format: data.format,
                    salesCount: data.salesCount,
                    isActive: data.isActive, 
                });
            });
            console.log('Ebook data collected.');

            // Filter the eBooks by keywords and isActive
            const matchedEbooks = queryResult.filter(ebook =>
                ebook.isActive && keywords.some(keyword => ebook.title.toLowerCase().includes(keyword.toLowerCase()))
            );

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('ebooks', queryResult);

            const responseDto: GetEbooksResponseDto = {
                statusCode: 200,
                message: 'EBOOKSGOT',
                ebooksFound: matchedEbooks,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the ebooks.');
        }
    }


    @ApiOperation({ summary: 'Upload an ebook file to Datastorage' })
    @ApiParam({ name: 'userEmail', description: 'User email. Must be from a registered user' })
    @ApiOkResponse({ description: 'Ebook file uploaded successfully', type: UploadEbookResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async uploadEbookFile(userEmail: string, file: any): Promise<UploadEbookResponseDto> {
        try {
            const mediaFileName = `${Date.now()}_${file.originalname}`;
            const mediaPath = `users/${userEmail}/ebooks/${mediaFileName}`;

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

            const responseDto = new UploadEbookResponseDto(201, 'EBOOKUPLOADEDSUCCESSFULLY');
            return responseDto;
        } catch (error) {
            console.error('Error uploading the file:', error);
            throw new Error(`Error uploading the file: ${error.message}`);
        }
    }





    @ApiOperation({ summary: 'Upload to Datastorage and create an ebook on Firestore' })
    @ApiParam({ name: 'userEmail', description: 'User email. Must be from a registered user' })
    @ApiOkResponse({ description: 'Ebook uploaded and created successfully', type: UploadEbookResponseDto })
    @ApiBadRequestResponse({ description: 'User not found or publisher not registered' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async uploadAndCreateEbook(
        file: any,
        createNewEbookDto: CreateEbookDto
    ): Promise<UploadEbookResponseDto> {
        try {
            

            const { title, description, author, releaseDate, price, language, pageCount, genres, format, publisher, titlePage } = createNewEbookDto;

            const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
            const ebookQuery = query(ebookRef);
            const ebookQuerySnapshot = await getDocs(ebookQuery);

            // Check if the title already exists in the collection
            const titleQuery = query(ebookRef, where('title', '==', title));
            const titleQuerySnapshot = await getDocs(titleQuery);

            if (!titleQuerySnapshot.empty) {
                throw new BadRequestException('TITLE ALREADY EXISTS');
            }


            const userRef = collection(this.firebaseService.fireStore, 'users');
            const userQuery = query(userRef, where('username', '==', publisher));
            const userQuerySnapshot = await getDocs(userQuery);




            if (userQuerySnapshot.empty) {
                throw new BadRequestException('PUBLISHER NOT FOUND. ENTER THE USERNAME OF A REGISTERED USER');
            }


            const newEbookId: string = uuidv4();

            const mediaFileName = `${Date.now()}_${file.originalname}`;
            const mediaPath = `assets/${newEbookId}/${mediaFileName}`;


            const newEbook: Ebook = {
                id: newEbookId,
                title: title,
                publisher: publisher,
                description: description,
                url: mediaPath,
                titlePage: titlePage,
                author: author,
                releaseDate: releaseDate,
                price: price,
                language: language,
                pageCount: pageCount,
                genres: genres,
                format: format,
                salesCount: 0,
                isActive: true,
            };

            const newEbookDocRef = await addDoc(ebookRef, newEbook);

            const cachedCourses = await this.firebaseService.getCollectionData('ebooks');
            cachedCourses.push({
                id: newEbookId,
                title,
                publisher,
                description,
                author,
                releaseDate,
                price,
                language,
                pageCount,
                genres,
                format,
                salesCount: 0,
                isActive: true,
                titlePage,
                url: mediaPath,

            });



           

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

           

            this.firebaseService.setCollectionData('ebooks', cachedCourses);
            console.log('Ebook added to the cache successfully.');

            const responseDto = new UploadEbookResponseDto(201, 'EBOOKUPLOADEDSUCCESSFULLY');
            return responseDto;
        } catch (error) {
            console.error('Error uploading the file or creating ebook:', error);
            throw new Error(`Error uploading the file or creating ebook: ${error.message}`);
        }
    }








}