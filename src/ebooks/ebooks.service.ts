import * as admin from 'firebase-admin';
import { Ebook, EbookFormat } from './entities/ebooks.entity';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateEbookDto } from './dto/createEbook.dto';
import { CreateEbookResponseDto } from './dto/createEbookResponse.dto';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, QueryFieldFilterConstraint, Timestamp, updateDoc, where } from 'firebase/firestore';
import { GetEbooksResponseDto } from './dto/getEbooksResponse.dto';
import { UploadEbookResponseDto } from './dto/uploadEbookResponse.dto';
import { Readable } from 'stream';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { UpdateEbookResponseDto } from './dto/updateEbookResponse.dto';
import { UpdateEbookDto } from './dto/updateEbook.dto';
import { convertFirestoreTimestamp } from '../utils/timeUtils.dto';
import { PDFDocument, rgb } from 'pdf-lib';
import { PersonalizeEbookResponseDto } from './dto/personalizeEbookResponse.dto';
import { StripeService } from '../Pluggins/stripe/stripe.service';
import { PurchaseEbookResponseDto } from './dto/purchaseEbookResponse.dto';
import { GetEbookByIdResponseDto } from './dto/getEbookByIdResponse.dto';



@Injectable()
export class EbookService {

    constructor(private firebaseService: FirebaseService, private stripeService: StripeService) { }




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
                const response: UpdateEbookResponseDto = {
                    statusCode: 404,
                    message: 'EBOOK NOT FOUND',
                };
                return response;            }

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
                const activeEbooks = cachedEbooks.filter(ebook => ebook.active);

                // Convert releaseDate in cached ebooks using the imported function
                const activeEbooksWithFormattedDates = activeEbooks.map(ebook => ({
                    ...ebook,
                    releaseDate: convertFirestoreTimestamp(ebook.releaseDate),
                }));

                const getEbooksDtoResponse: GetEbooksResponseDto = {
                    statusCode: 200,
                    message: "EBOOKSGOT",
                    ebooksFound: activeEbooksWithFormattedDates,
                };
                return getEbooksDtoResponse;
            }

            // If there is no data in cache, it uses firestore instead
            const ebooksRef = this.firebaseService.ebooksCollection;
            const ebooksQuery = query(ebooksRef, where("active", "==", true));
            console.log('Ebooks query created.');

            const ebooksQuerySnapshot = await getDocs(ebooksQuery);
            console.log('Ebooks query snapshot obtained.');

            const queryResult = [];
            ebooksQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                const releaseTimestamp: Timestamp = data.releaseDate;
                const releaseDate = convertFirestoreTimestamp(releaseTimestamp);
                queryResult.push({
                    title: data.title,
                    publisher: data.publisher,
                    author: data.author,
                    description: data.description,
                    titlePage: data.titlePage,
                    url: data.url,
                    releaseDate: releaseDate,
                    price: data.price,
                    language: data.language,
                    pageCount: data.pageCount,
                    genres: data.genres,
                    format: data.format,
                    salesCount: data.salesCount,
                    active: data.active,
                });
            });
            console.log('Ebook data collected.');

            const queryResultWithFormattedDates = queryResult.map(ebook => ({
                ...ebook,
                releaseDate: convertFirestoreTimestamp(ebook.releaseDate),
            }));

            // Save the data in cache for future queries
            await this.firebaseService.setCollectionData('ebooks', queryResult);

            const getEbooksDtoResponse: GetEbooksResponseDto = {
                statusCode: 200,
                message: "EBOOKSGOT",
                ebooksFound: queryResultWithFormattedDates,
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
    async getEbooksByKeywords(keywords: string[] | string): Promise<GetEbooksResponseDto> {
        try {
            console.log('Initializing getEbooksByKeywords...');

            if (typeof keywords === 'string') {
                keywords = [keywords];
            }

            // Tries to use data in cache if it exists
            const cachedEbooks = await this.firebaseService.getCollectionData('ebooks');
            if (cachedEbooks.length > 0) {
                console.log('Using cached ebooks data.');
                const matchedEbooks = cachedEbooks.filter(ebook =>
                    ebook.active && this.ebookMatchesKeywords(ebook, keywords)
                );

                const matchedEbooksWithFormattedDates = matchedEbooks.map(ebook => ({
                    ...ebook,
                    releaseDate: convertFirestoreTimestamp(ebook.releaseDate),
                }));

                if (matchedEbooksWithFormattedDates.length = 0) {
                    const responseDto: GetEbooksResponseDto = {
                        statusCode: 404,
                        message: 'EBOOKS NOT FOUND',
                        ebooksFound: null,
                    };
                    return responseDto;
                }

                const responseDto: GetEbooksResponseDto = {
                    statusCode: 200,
                    message: 'EBOOKS GOT',
                    ebooksFound: matchedEbooksWithFormattedDates,
                };
                return responseDto;
            }

            else if (cachedEbooks.length = 0) {
                const responseDto: GetEbooksResponseDto = {
                    statusCode: 404,
                    message: 'EBOOKS NOT FOUND',
                    ebooksFound: null,
                };
                return responseDto;
            }

            // If there is no data in cache, query Firestore
            const ebooksRef = this.firebaseService.ebooksCollection;
            const ebooksQuery = query(ebooksRef, where("active", "==", true));
            console.log('Ebooks query created.');

            const ebooksQuerySnapshot = await getDocs(ebooksQuery);
            console.log('Ebooks query snapshot obtained.');

            const queryResult = [];
            ebooksQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.active) {
                    const releaseTimestamp: Timestamp = data.releaseDate;
                    const releaseDate = convertFirestoreTimestamp(releaseTimestamp);
                    queryResult.push({
                        title: data.title,
                        publisher: data.publisher,
                        author: data.author,
                        description: data.description,
                        titlePage: data.titlePage,
                        url: data.url,
                        releaseDate: releaseDate,
                        price: data.price,
                        language: data.language,
                        pageCount: data.pageCount,
                        genres: data.genres,
                        format: data.format,
                        salesCount: data.salesCount,
                        active: data.active,
                    });
                }
            });
            console.log('Ebook data collected.');

            const matchedEbooks = queryResult.filter(ebook =>
                this.ebookMatchesKeywords(ebook, keywords)
            );

            const matchedEbooksWithFormattedDates = matchedEbooks.map(ebook => ({
                ...ebook,
                releaseDate: convertFirestoreTimestamp(ebook.releaseDate),
            }));

            await this.firebaseService.setCollectionData('ebooks', queryResult);

            const responseDto: GetEbooksResponseDto = {
                statusCode: 200,
                message: 'EBOOKSGOT',
                ebooksFound: matchedEbooksWithFormattedDates,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the ebooks.');
        }
    }

    private ebookMatchesKeywords(ebook: Ebook, keywords: string[] | string): boolean {
        if (typeof keywords === 'string') {
            keywords = [keywords];
        }

        const lowerCaseTitle = ebook.title.toLowerCase();
        return keywords.every(keyword => lowerCaseTitle.includes(keyword.toLowerCase()));
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


            const maxFileSize = 60 * 1024 * 1024; // 60 MB

            if (file.size > maxFileSize) {
                return {
                    statusCode: 400,
                    message: 'Max size for the file exceeded',
                };
            }


            const { title, description, author, releaseDate, price, language, pageCount, genres, format, publisher, titlePage } = createNewEbookDto;

            const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
            const ebookQuery = query(ebookRef);
            const ebookQuerySnapshot = await getDocs(ebookQuery);


            const userRef = collection(this.firebaseService.fireStore, 'users');
            const userQuery = query(userRef, where('username', '==', publisher));
            const userQuerySnapshot = await getDocs(userQuery);




            if (userQuerySnapshot.empty) {
                const response: UploadEbookResponseDto = {
                    statusCode: 404,
                    message: 'PUBLISHER NOT FOUND',
                };
                return response;
            }


            const newEbookId: string = uuidv4();

            const mediaFileName = `${Date.now()}_${file.originalname}`;
            const mediaPath = `assets/${newEbookId}/${mediaFileName}`;

          


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


            const newEbook: Ebook = {
                id: newEbookId,
                title: title,
                publisher: publisher,
                description: description,
                url,
                bucketReference: mediaPath,
                titlePage: titlePage,
                author: author,
                releaseDate: releaseDate,
                price: price,
                language: language,
                pageCount: pageCount,
                genres: genres,
                format: format,
                salesCount: 0,
                active: true,
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
                active: true,
                titlePage,
                url,
                bucketReference: mediaPath,


            });



           

           

           

            this.firebaseService.setCollectionData('ebooks', cachedCourses);
            console.log('Ebook added to the cache successfully.');

            const responseDto = new UploadEbookResponseDto(201, 'EBOOKUPLOADEDSUCCESSFULLY', newEbookId);
            return responseDto;
        } catch (error) {
            console.error('Error uploading the file or creating ebook:', error);
            throw new Error(`Error uploading the file or creating ebook: ${error.message}`);
        }
    }


    //PDF

    async purchasePdf(userId: string, ebookId: string): Promise<PersonalizeEbookResponseDto> {
        try {
            const userCollectionRef = admin.firestore().collection('users');
            const userQuerySnapshot = await userCollectionRef.where('id', '==', userId).get();

            let userInfo = null;
            if (!userQuerySnapshot.empty) {
                const userData = userQuerySnapshot.docs[0].data();
                userInfo = {
                    email: userData.email,
                    username: userData.username,
                    name: userData.name,
                };
            } else {
                throw new Error(`NO USER FOUND WITH ID ${userId}`);
            }

            const ebookCollectionRef = admin.firestore().collection('ebooks');
            const ebookQuerySnapshot = await ebookCollectionRef.where('id', '==', ebookId).get();

            if (!ebookQuerySnapshot.empty) {
                const ebookData = ebookQuerySnapshot.docs[0].data();
                const ebookUrl = ebookData.url;
                const ebookBucketReference = ebookData.bucketReference
                const actualDate = new Date();
                const day = actualDate.getDate().toString().padStart(2, '0');
                const month = (actualDate.getMonth() + 1).toString().padStart(2, '0');
                const year = actualDate.getFullYear();

                const formattedDate = `${day}/${month}/${year}`;

                const addedText = `This ebook was purchased on ${formattedDate} by: \n${userInfo.name} and email: ${userInfo.email} through AGA SOCIAL LLC`;
                const response = await this.personalizePdf(addedText, ebookId, ebookBucketReference);

                return response            } else {
                throw new Error(`NO EBOOK FOUND FOR ID ${ebookId}`);
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }


    private async personalizePdf(newText, ebookId, ebookBucketReference): Promise<PersonalizeEbookResponseDto> {
        try {
            const fileBucket = admin.storage().bucket();


            console.log('Downloading original PDF...');
            const originalEbookFile = fileBucket.file(ebookBucketReference);
            const [originalEbookBuffer] = await originalEbookFile.download();

            console.log('Creating modified PDF...');
            const pdfDoc = await PDFDocument.load(originalEbookBuffer);
            const page = pdfDoc.addPage();
            const font = await pdfDoc.embedFont('Helvetica');
            page.drawText(newText, { x: 50, y: 350, font, color: rgb(0, 0, 0), size: 12 });
            const modifiedEbookBytes = await pdfDoc.save();

            console.log('Saving modified PDF...');
            const copyId: string = uuidv4();
            const mediaPath = `assets/${ebookId}/${copyId}.pdf`;

            const modifiedEbookBuffer = Buffer.from(modifiedEbookBytes);
            const modifiedEbookFile = fileBucket.file(mediaPath);
            await modifiedEbookFile.save(modifiedEbookBuffer);

            console.log('Generating signed URL...');
            const [signedUrl] = await modifiedEbookFile.getSignedUrl({
                action: 'read',
                expires: '09-30-2100',
            });

            console.log('Process completed successfully.');
            return new PersonalizeEbookResponseDto(200, 'EBOOKPERSONALIZEDSUCCESSFULLY', signedUrl);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }




    async purchaseEbook(userId: string, ebookId: string, paymentIntentId: string): Promise<PurchaseEbookResponseDto> {
        try {
            const ebookQuerySnapshot = await admin
                .firestore()
                .collection('ebooks')
                .where('id', '==', ebookId)
                .get();

            if (ebookQuerySnapshot.empty) {
                throw new Error('Ebook not found');
            }

            const ebookDoc = ebookQuerySnapshot.docs[0];
            const ebookData = ebookDoc.data();
            const ebookPriceInCents = ebookData.price * 100;

            const paymentConfirmed = await this.stripeService.confirmPayment(paymentIntentId);

            if (paymentConfirmed) {
                const userDoc = await admin.firestore().collection('users').doc(userId).get();
                const purchasedBooks = userDoc.data()?.purchasedBooks || [];

                const updatedPurchasedBooks = [...purchasedBooks, ebookId];

                await admin.firestore().collection('users').doc(userId).update({
                    purchasedBooks: updatedPurchasedBooks,
                });

                const response = new PurchaseEbookResponseDto(201, 'EBOOKPURCHASEDSUCCESSFULLY');
                return response;
            } else {
                const response = new PurchaseEbookResponseDto(400, 'Payment could not be completed');
                return response;
            }
        } catch (error) {
            console.error('Error purchasing eBook:', error);
            throw error;
        }
    }



    @ApiOperation({ summary: 'Get a specific ebook from Firestore by ID' })
    @ApiOkResponse({ description: 'Ebook retrieved successfully', type: GetEbookByIdResponseDto })
    @ApiNotFoundResponse({ description: 'Ebook not found' })
    async getEbookById(ebookId: string): Promise<GetEbookByIdResponseDto> {
        try {
            const ebooksRef = this.firebaseService.ebooksCollection;
            const ebooksQuery = query(ebooksRef, where("id", "==", ebookId));

            const ebooksQuerySnapshot = await getDocs(ebooksQuery);

            if (!ebooksQuerySnapshot.empty) {
                const ebookDocSnapshot = ebooksQuerySnapshot.docs[0];

                const ebookData = ebookDocSnapshot.data();
                const releaseTimestamp: Timestamp = ebookData.releaseDate;
                const releaseDate = convertFirestoreTimestamp(releaseTimestamp);

                const ebookFound: Ebook = {
                    title: ebookData.title,
                    publisher: ebookData.publisher,
                    author: ebookData.author,
                    description: ebookData.description,
                    titlePage: ebookData.titlePage,
                    url: ebookData.url,
                    releaseDate: releaseDate,
                    price: ebookData.price,
                    language: ebookData.language,
                    pageCount: ebookData.pageCount,
                    genres: ebookData.genres,
                    format: ebookData.format,
                    salesCount: ebookData.salesCount,
                    active: ebookData.active,
                };

                const ebookResponse: GetEbookByIdResponseDto = {
                    statusCode: 200,
                    message: "EBOOKRETRIEVEDSUCCESSFULLY",
                    ebookFound: ebookFound,
                };

                return ebookResponse;
            } else {
                const response: GetEbookByIdResponseDto = {
                    statusCode: 404,
                    message: 'EBOOK NOT FOUND',
                    ebookFound: null
                };
                return response;            }
        } catch (error) {
            throw new Error('There was an error retrieving the ebook by ID.');
        }
    }



    @ApiOperation({
        summary: 'Get books purchased by the user',
        description: 'Fetches a list of books that have been purchased by the specified user.',
    })
    @ApiOkResponse({
        description: 'Books retrieved successfully',
        type: GetEbooksResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'No ebooks found for the user',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    async getPurchasedBooks(userId: string): Promise<GetEbooksResponseDto> {
        try {
            const usersRef = this.firebaseService.usersCollection;
            const usersQuery = query(usersRef, where('id', '==', userId));
            const usersQuerySnapshot = await getDocs(usersQuery);
            const userDoc = usersQuerySnapshot.docs[0];

            if (!userDoc) {
                const response: GetEbooksResponseDto = {
                    statusCode: 404,
                    message: 'USER DOES NOT EXIST',
                    ebooksFound: []
                };
                return response;
}

            const userData = userDoc.data();

            if (!userData.purchasedBooks || userData.purchasedBooks.length === 0) {
                const response: GetEbooksResponseDto = {
                    statusCode: 404,
                    message: 'USER HAS NO EBOOKS',
                    ebooksFound: []
                };
                return response;            }

            const purchasedEbookIds: string[] = userData.purchasedBooks;
            const purchasedEbooksDetails: Ebook[] = [];

            const ebooksRef = this.firebaseService.ebooksCollection;
            const ebooksQuery = query(ebooksRef, where('id', 'in', purchasedEbookIds));
            const ebooksQuerySnapshot = await getDocs(ebooksQuery);



            ebooksQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                const releaseTimestamp: Timestamp = data.releaseDate;
                const releaseDate = convertFirestoreTimestamp(releaseTimestamp);
                const ebookDetails: Ebook = {
                    title: data.title,
                    publisher: data.publisher,
                    author: data.author,
                    description: data.description,
                    titlePage: data.titlePage,
                    url: data.url,
                    releaseDate: releaseDate,
                    price: data.price,
                    language: data.language,
                    pageCount: data.pageCount,
                    genres: data.genres,
                    format: data.format,
                    salesCount: data.salesCount,
                    active: data.active,
                };
                purchasedEbooksDetails.push(ebookDetails);
            });

            return new GetEbooksResponseDto(200, 'EBOOKS_RETRIEVED_SUCCESSFULLY', purchasedEbooksDetails);
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the purchased books for the user.');
        }
    }


   


}