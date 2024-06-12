import * as admin from 'firebase-admin';
import { Ebook, EbookFormat } from './entities/ebooks.entity';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateEbookDto } from './dto/createEbook.dto';
import { CreateEbookResponseDto } from './dto/createEbookResponse.dto';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, QueryFieldFilterConstraint, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
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




   
    async updateEbook(id: string, newData: Partial<UpdateEbookDto>): Promise<UpdateEbookResponseDto> {
        try {
            console.log('Initializing updateEbook...');
            const ebooksCollectionRef = admin.firestore().collection('ebooks');

            const querySnapshot = await ebooksCollectionRef.where('id', '==', id).get();

            if (querySnapshot.empty) {
                console.log(`The ebook with the id "${id}" does not exist.`);
                const response: UpdateEbookResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'The ebook was not found.',
                    data: {
                        result: {}
                    }
                };
                return response;
            }

            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, newData);
            });

            await batch.commit();
            console.log(`Updated info for ebook with id "${id}"`);

            const cachedEbooks = await this.firebaseService.getCollectionData('ebooks');
            const updatedEbookIndex = cachedEbooks.findIndex((ebook) => ebook.id === id);
            if (updatedEbookIndex !== -1) {
                cachedEbooks[updatedEbookIndex] = { ...cachedEbooks[updatedEbookIndex], ...newData };
                this.firebaseService.setCollectionData('ebooks', cachedEbooks);
            }

            const response: UpdateEbookResponseDto = {
                status: 'success',
                code: 200,
                message: 'The ebook was updated successfully.',
                data: {
                    result: {  }
                }
            };

            return response;
        } catch (error) {
            console.error('There was an error updating the ebook data:', error);
            const response: UpdateEbookResponseDto = {
                status: 'error',
                code: 400,
                message: 'Error updating ebook data.',
                data: {
                    result: {}
                }
            };
            return response;
        }
    }
    


   


    async getEbooks(): Promise<GetEbooksResponseDto> {
        try {
            console.log('Initializing getEbooks...');

            const cachedEbooks = await this.firebaseService.getCollectionData('ebooks');
            if (cachedEbooks.length > 0) {
                console.log('Using cached ebooks data.');
                const activeEbooks = cachedEbooks.filter(ebook => ebook.active);

                const activeEbooksWithFormattedDates = activeEbooks.map(ebook => ({
                    ...ebook,
                    releaseDate: convertFirestoreTimestamp(ebook.releaseDate),
                }));

                if (cachedEbooks.length == 0) {
                    const response: GetEbooksResponseDto = {
                        status: 'error',
                        code: 404,
                        message: 'No ebooks found.',
                        data: {
                            result: {}
                        }
                    };
                    return response;
                }


                const getEbooksDtoResponse: GetEbooksResponseDto = {
                    status: 'success',
                    code: 200,
                    message: "Ebooks retrieved successfully.",
                    data: {
                        result: activeEbooksWithFormattedDates,
                    },
                };
                return getEbooksDtoResponse;
            }

            const ebooksRef = this.firebaseService.ebooksCollection;
            const ebooksQuery = query(ebooksRef, where("active", "==", true));

            const ebooksQuerySnapshot = await getDocs(ebooksQuery);

            if (ebooksQuerySnapshot.empty) {
                console.log('No ebooks found.');
                const response: GetEbooksResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'No ebooks found.',
                    data: {
                        result: {}
                    }
                };
                return response;
            }

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

            const queryResultWithFormattedDates = queryResult.map(ebook => ({
                ...ebook,
                releaseDate: convertFirestoreTimestamp(ebook.releaseDate),
            }));
            await this.firebaseService.setCollectionData('ebooks', queryResult);

            const getEbooksDtoResponse: GetEbooksResponseDto = {
                status: 'success',
                code: 200,
                message: "Ebooks retrieved successfully.",
                data: {
                    result: queryResultWithFormattedDates,
                },
            };
            console.log('Response created.');

            return getEbooksDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            const response: GetEbooksResponseDto = {
                status: 'error',
                code: 400,
                message: 'Error retrieving ebooks.',
                data: {
                    result: []
                }
            };
            return response;
        }
    }





   
    async getEbooksByKeywords(keywords: string[] | string): Promise<GetEbooksResponseDto> {
        try {
            console.log('Initializing getEbooksByKeywords...');

            if (typeof keywords === 'string') {
                keywords = [keywords];
            }

            const cachedEbooks = await this.firebaseService.getCollectionData('ebooks');
            if (cachedEbooks.length > 0) {
                console.log('Using cached ebooks data.');
                const matchedEbooks = cachedEbooks.filter(ebook =>
                    ebook.active && this.ebookMatchesKeywords(ebook, keywords)
                );

                if (matchedEbooks.length === 0) {
                    const responseDto: GetEbooksResponseDto = {
                        status: 'error',
                        code: 404,
                        message: 'Ebooks not found.',
                        data: {
                            result: {},
                        },
                    };
                    return responseDto;
                }

                const matchedEbooksWithFormattedDates = matchedEbooks.map(ebook => ({
                    ...ebook,
                    releaseDate: convertFirestoreTimestamp(ebook.releaseDate),
                }));

                const responseDto: GetEbooksResponseDto = {
                    status: 'success',
                    code: 200,
                    message: 'Ebooks retrieved successfully.',
                    data: {
                        result: matchedEbooksWithFormattedDates,
                    },
                };
                return responseDto;
            }

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

            const matchedEbooks = queryResult.filter(ebook =>
                this.ebookMatchesKeywords(ebook, keywords)
            );

            if (matchedEbooks.length === 0) {
                const responseDto: GetEbooksResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Ebooks not found.',
                    data: {
                        result: {},
                    },
                };
                return responseDto;
            }

            const matchedEbooksWithFormattedDates = matchedEbooks.map(ebook => ({
                ...ebook,
                releaseDate: convertFirestoreTimestamp(ebook.releaseDate),
            }));

            await this.firebaseService.setCollectionData('ebooks', queryResult);

            const responseDto: GetEbooksResponseDto = {
                status: 'success',
                code: 200,
                message: 'Ebooks retrieved successfully.',
                data: {
                    result: matchedEbooksWithFormattedDates,
                },
            };

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            const response: GetEbooksResponseDto = {
                status: 'error',
                code: 400,
                message: 'Error retrieving ebooks.',
                data: {
                    result: {},
                },
            };
            return response;
        }
    }






    private ebookMatchesKeywords(ebook: Ebook, keywords: string[] | string): boolean {
        if (typeof keywords === 'string') {
            keywords = [keywords];
        }

        const lowerCaseTitle = ebook.title.toLowerCase();
        return keywords.every(keyword => lowerCaseTitle.includes(keyword.toLowerCase()));
    }








    async uploadAndCreateEbook(
        file: any,
        createNewEbookDto: CreateEbookDto
    ): Promise<UploadEbookResponseDto> {
        try {
            const maxFileSize = 60 * 1024 * 1024; // 60 MB

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

            const {
                title,
                description,
                author,
                releaseDate,
                price,
                language,
                pageCount,
                genres,
                format,
                publisher,
                titlePage,
            } = createNewEbookDto;

            const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');

            const mediaFileName = `${Date.now()}_${file.originalname}`;
            const mediaPath = `assets/${mediaFileName}`;

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

            const newEbookData: Ebook = {
                title,
                publisher,
                description,
                url,
                bucketReference: mediaPath,
                titlePage,
                author,
                releaseDate,
                price,
                language,
                pageCount,
                genres,
                format,
                salesCount: 0,
                active: true,
            };

            const newEbookDocRef = await addDoc(ebookRef, newEbookData);

            newEbookData.id = newEbookDocRef.id;

            await setDoc(doc(this.firebaseService.fireStore, 'ebooks', newEbookDocRef.id), newEbookData);

            const cachedCourses = await this.firebaseService.getCollectionData('ebooks');
            cachedCourses.push({
                id: newEbookDocRef.id, 
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

            const responseDto = new UploadEbookResponseDto(
                'success',
                201,
                'Ebook created and registered successfully.',
                { result: { ebookId: newEbookDocRef.id } }
            );
            return responseDto;
        } catch (error) {
            console.error('Error uploading the file or creating ebook:', error);
            const response: UploadEbookResponseDto = {
                status: 'error',
                code: 400,
                message: 'Error uploading ebook.',
                data: {
                    result: {},
                },
            };
            return response;
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
                return {
                    status: 'error',
                    code: 404,
                    message: `No user found with given ID ${userId}`,
                    data: {
                        result: {},
                    },
                };
            }

            const ebookCollectionRef = admin.firestore().collection('ebooks');
            const ebookQuerySnapshot = await ebookCollectionRef.where('id', '==', ebookId).get();

            if (!ebookQuerySnapshot.empty) {
                const ebookData = ebookQuerySnapshot.docs[0].data();
                const ebookUrl = ebookData.url;
                const ebookBucketReference = ebookData.bucketReference;
                const actualDate = new Date();
                const day = actualDate.getDate().toString().padStart(2, '0');
                const month = (actualDate.getMonth() + 1).toString().padStart(2, '0');
                const year = actualDate.getFullYear();

                const formattedDate = `${day}/${month}/${year}`;

                const addedText = `This ebook was purchased on ${formattedDate} by: \n${userInfo.name} and email: ${userInfo.email} through AGA SOCIAL LLC`;

                const response = await this.personalizePdf(addedText, ebookId, ebookBucketReference);

                return response;
            } else {
                return {
                    status: 'error',
                    code: 404,
                    message: `No ebook was found for ID ${ebookId}`,
                    data: {
                        result: null,
                    },
                };
            }
        } catch (error) {
            console.error('Error:', error);
            return {
                status: 'error',
                code: 400,
                message: 'There was an error personalizing the ebook.',
                data: {
                    result: {},
                },
            };
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
            return new PersonalizeEbookResponseDto('success', 200, 'Ebook personalized successfully.', { signedUrl });
        } catch (error) {
            console.error('Error:', error);
            return new PersonalizeEbookResponseDto('error', 400, 'Failed to personalize ebook.', { });
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
                return new PurchaseEbookResponseDto('error', 404, 'Ebook not found', {});
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

                return new PurchaseEbookResponseDto('success', 201, 'Ebook purchased successfully', {});
            } else {
                return new PurchaseEbookResponseDto('error', 400, 'Payment could not be completed', {});
            }
        } catch (error) {
            console.error('Error purchasing eBook:', error);
            return new PurchaseEbookResponseDto('error', 400, 'Payment could not be completed', {});
        }
    }



    
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
                    status: 'success',
                    code: 200,
                    message: "Ebook retrieved successfully.",
                    data: {
                        result: { ebookFound }
                    },
                };

                return ebookResponse;
            } else {
                const response: GetEbookByIdResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Ebook not found',
                    data: {
                        result: {}
                    }
                };
                return response;
            }
        } catch (error) {
            const response: GetEbookByIdResponseDto = {
                status: 'error',
                code: 400,
                message: 'Ebook could not be retrieved.',
                data: {
                    result: {}
                }
            };
            return response;
        }
    }




    
    async getPurchasedBooks(userId: string): Promise<GetEbooksResponseDto> {
        try {
            const usersRef = this.firebaseService.usersCollection;
            const usersQuery = query(usersRef, where('id', '==', userId));
            const usersQuerySnapshot = await getDocs(usersQuery);
            const userDoc = usersQuerySnapshot.docs[0];

            if (!userDoc) {
                const response: GetEbooksResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'User not found.',
                    data: {
                        result: {}
                    }
                };
                return response;
            }

            const userData = userDoc.data();

            if (!userData.purchasedBooks || userData.purchasedBooks.length === 0) {
                const response: GetEbooksResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'This user has no purchased ebooks.',
                    data: {
                        result: {}
                    }
                };
                return response;
            }

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

            return new GetEbooksResponseDto('success', 200, 'Ebooks retrieved successfully.', { result: purchasedEbooksDetails });
        } catch (error) {
            console.error('An error occurred:', error);
            return new GetEbooksResponseDto('error', 400, 'Ebooks could not be retrieved.', {});
        }
    }

   


}