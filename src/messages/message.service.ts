import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, QueryFieldFilterConstraint, Timestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { FirebaseService } from "../firebase/firebase.service";
import { CreateMessageDto, MessageType } from "./dto/createMessage.dto";
import { CreateMessageResponseDto } from "./dto/createMessageResponse.dto";
import { GetMessagesByUserResponseDto } from "./dto/getMessagesByUserResponse.dto";
import { UpdateMessageStatusDto } from "./dto/updateMessageStatus.dto";
import { UpdateMessageStatusResponseDto } from "./dto/updateMessageStatusResponse.dto";
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { AddTagsResponseDto } from "./dto/addTagsResponse.dto";
import { GetMessageByIdResponseDto } from "./dto/getMessageByIdResponse.dto";




@Injectable()
export class MessageService {

    constructor(private firebaseService: FirebaseService) { }




    @ApiOperation({ summary: 'get archived messages from a user' })
    @ApiOkResponse({ description: 'Messages retrieved successfully' })
    @ApiNotFoundResponse({ description: 'No messages found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getArchivedMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
            const messageRef = collection(this.firebaseService.fireStore, 'messages');
            const archivedMessagesQuery = query(
                messageRef,
                where('archived', '==', true),
                where('recipientEmail', '==', userEmail)
            );

            const archivedMessagesSnapshot = await getDocs(archivedMessagesQuery);
            const archivedMessages = [];

            archivedMessagesSnapshot.forEach((doc) => {
                const message = doc.data();
                if (message.active === true) {
                    archivedMessages.push({
                        id: message.id,
                        senderEmail: message.senderEmail,
                        recipientEmail: message.recipientEmail,
                        content: message.content,
                        read: message.read,
                        highlighted: message.highlighted,
                        attachmentUrls: message.attachmentUrls,
                        subject: message.subject,
                        type: message.type,
                        receivedDate: this.transformTimestamp(message.receivedDate),
                        sentDate: this.transformTimestamp(message.sentDate),
                        readDate: this.transformTimestamp(message.readDate),
                    });
                }
            });

            if (archivedMessages.length === 0) {
                const responseDto = new GetMessagesByUserResponseDto(
                    404,
                    'ARCHIVEDMESSAGESNOTFOUND',
                    archivedMessages
                );
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                200,
                'ARCHIVEDMESSAGESRETRIEVEDSUCCESSFULLY',
                archivedMessages
            );
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }





    @ApiOperation({ summary: 'get read messages from a user' })
    @ApiOkResponse({ description: 'Messages retrieved successfully' })
    @ApiNotFoundResponse({ description: 'No messages found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getReadMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
            const messageRef = collection(this.firebaseService.fireStore, 'messages');
            const readMessagesQuery = query(
                messageRef,
                where('read', '==', true),
                where('recipientEmail', '==', userEmail)
            );

            const readMessagesSnapshot = await getDocs(readMessagesQuery);
            const readMessages = [];

            readMessagesSnapshot.forEach((doc) => {
                const message = doc.data();
                if (message.active === true) {
                    readMessages.push({
                        id: message.id,
                        highlighted: message.highlighted,
                        senderEmail: message.senderEmail,
                        recipientEmail: message.recipientEmail,
                        content: message.content,
                        archived: message.archived,
                        attachmentUrls: message.attachmentUrls,
                        subject: message.subject,
                        type: message.type,
                        receivedDate: this.transformTimestamp(message.receivedDate),
                        sentDate: this.transformTimestamp(message.sentDate),
                        readDate: this.transformTimestamp(message.readDate),
                    });
                }
            });

            if (readMessages.length === 0) {
                const responseDto = new GetMessagesByUserResponseDto(
                    404,
                    'READMESSAGESNOTFOUND',
                    readMessages
                );
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                200,
                'READMESSAGESRETRIEVEDSUCCESSFULLY',
                readMessages
            );
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }




    @ApiOperation({ summary: 'get unread messages from a user' })
    @ApiOkResponse({ description: 'Messages retrieved successfully' })
    @ApiNotFoundResponse({ description: 'No messages found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getUnreadMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
            const messageRef = collection(this.firebaseService.fireStore, 'messages');
            const unreadMessagesQuery = query(
                messageRef,
                where('read', '==', false),
                where('recipientEmail', '==', userEmail)
            );

            const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
            const unreadMessages = [];

            unreadMessagesSnapshot.forEach((doc) => {
                const message = doc.data();
                if (message.active === true) {
                    unreadMessages.push({
                        id: message.id,
                        senderEmail: message.senderEmail,
                        recipientEmail: message.recipientEmail,
                        content: message.content,
                        archived: message.archived,
                        highlighted: message.highlighted,
                        attachmentUrls: message.attachmentUrls,
                        subject: message.subject,
                        type: message.type,
                        receivedDate: this.transformTimestamp(message.receivedDate),
                        sentDate: this.transformTimestamp(message.sentDate),
                        readDate: this.transformTimestamp(message.readDate),
                    });
                }
            });

            if (unreadMessages.length === 0) {
                const responseDto = new GetMessagesByUserResponseDto(
                    404,
                    'UNREADMESSAGESNOTFOUND',
                    unreadMessages
                );
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                200,
                'UNREADMESSAGESRETRIEVEDSUCCESSFULLY',
                unreadMessages
            );
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }






    @ApiOperation({ summary: 'Create and send a new message' })
    @ApiCreatedResponse({ description: 'Message created and sent successfully', type: CreateMessageResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request or not found', type: NotFoundException })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async createAndSendMessage(createMessageDto: CreateMessageDto): Promise<CreateMessageResponseDto> {
        try {
            console.log('Creating and sending a new message...');

            const { senderEmail, recipientEmail, content, subject, type, attachmentUrls } = createMessageDto;

            const senderExists = await this.firebaseService.getUserByEmail(senderEmail);
            const recipientExists = await this.firebaseService.getUserByEmail(recipientEmail);

            if (!senderExists) {
                throw new NotFoundException('Sender email not found');
            }

            if (!recipientExists) {
                throw new NotFoundException('Recipient email not found');
            }

            const userCollectionRef = collection(this.firebaseService.fireStore, 'users');
            const q = query(userCollectionRef, where('email', '==', senderEmail));

            let profilePicture: string | undefined;


            try {
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    profilePicture = doc.data().profilePicture;
                }
            } catch (error) {
                console.error('There was an error obtaining the picture of the sender:', error);
                throw error;
            }
         


            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            const currentDate = new Date();
            const receivedDate = new Date(currentDate.getTime() + 30000); 
            const newMessageId: string = uuidv4();


            const newMessage = {
                senderEmail,
                id: newMessageId,
                recipientEmail,
                content,
                read: false,
                archived: false,
                attachmentUrls: attachmentUrls || [],
                subject,
                type,
                sentDate: currentDate,
                receivedDate: receivedDate,
                readDate: null,
                active: true,
                highlighted: false,
            };

            console.log('Creating new message...');
            const newMessageDocRef = await addDoc(messageRef, newMessage);

            // Update the cache
            const cachedMessages = await this.firebaseService.getCollectionData('messages');
            cachedMessages.push({
                senderEmail,
                recipientEmail,
                content,
                subject,
                type,
                attachmentUrls: attachmentUrls || [],
                read: false,
                archived: false,
                sentDate: currentDate,
                receivedDate: currentDate,
                readDate: null,
                active: true,
                highlighted: false,



            });
            this.firebaseService.setCollectionData('messages', cachedMessages);
            console.log('Message added to cache successfully.');

            console.log('Message created and sent successfully.');
            const responseDto = new CreateMessageResponseDto(201, 'MESSAGECREATEDSUCCESSFULLY', newMessageId, profilePicture);
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }



    @ApiOperation({ summary: 'Get messages for a user' })
    @ApiOkResponse({ description: 'User messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @ApiNotFoundResponse({ description: 'No messages found', type: NotFoundException })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getUserMessages(userId: string): Promise<GetMessagesByUserResponseDto> {
        try {
            console.log('User ID:', userId);

            // Query for user's email based on userId
            const userQuery = query(
                collection(this.firebaseService.fireStore, 'users'),
                where('id', '==', userId)
            );
            const userQuerySnapshot = await getDocs(userQuery);

            let userEmail: string | null = null;
            userQuerySnapshot.forEach((doc) => {
                const userData = doc.data();
                userEmail = userData.email; 
            });

            if (!userEmail) {
                console.log('User not found.');
                const responseDto = new GetMessagesByUserResponseDto(
                    404,
                    'USER NOT FOUND',
                    null
                );

                return responseDto;            }

            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            // Query for senderEmail
            const senderMessagesQuery = query(
                messageRef,
                where('senderEmail', '==', userEmail),
                where('active', '==', true)
            );
            const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

            const recipientMessagesQuery = query(
                messageRef,
                where('recipientEmail', '==', userEmail),
                where('active', '==', true)
            );
            const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

            const userMessages = [];

            // Add messages from sender
            senderMessagesQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                userMessages.push({
                    id: data.id,
                    senderEmail: data.senderEmail,
                    recipientEmail: data.recipientEmail,
                    content: data.content,
                    read: data.read,
                    archived: data.archived,
                    highlighted: data.highlighted,
                    attachmentUrls: data.attachmentUrls,
                    subject: data.subject,
                    type: data.type,
                    receivedDate: this.transformTimestamp(data.receivedDate),
                    sentDate: this.transformTimestamp(data.sentDate),
                    readDate: this.transformTimestamp(data.readDate),
                });
            });

            // Add messages from recipient
            recipientMessagesQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                userMessages.push({
                    id: data.id,
                    senderEmail: data.senderEmail,
                    recipientEmail: data.recipientEmail,
                    content: data.content,
                    read: data.read,
                    archived: data.archived,
                    attachmentUrls: data.attachmentUrls,
                    subject: data.subject,
                    type: data.type,
                    receivedDate: this.transformTimestamp(data.receivedDate),
                    sentDate: this.transformTimestamp(data.sentDate),
                    readDate: this.transformTimestamp(data.readDate),
                });
            });

            if (userMessages.length === 0) {
                const responseDto = new GetMessagesByUserResponseDto(
                    404,
                    'MESSAGESNOTFOUND',
                    userMessages
                );

                console.log('No received messages found.');
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                200,
                'MESSAGESRETRIEVEDSUCCESSFULLY',
                userMessages
            );

            console.log('User messages fetched successfully.');
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }




    
    @ApiOperation({ summary: 'Get received messages for a user' })
    @ApiOkResponse({ description: 'Received messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @ApiNotFoundResponse({ description: 'No messages found', type: NotFoundException })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getReceivedMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            // Query for recipientEmail and isActive
            const recipientMessagesQuery = query(
                messageRef,
                where('recipientEmail', '==', userEmail),
                where('active', '==', true)
            );
            const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

            const userMessages = [];

            // Add messages from recipient
            recipientMessagesQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                userMessages.push({
                    id: data.id,
                    senderEmail: data.senderEmail,
                    recipientEmail: data.recipientEmail,
                    content: data.content,
                    read: data.read,
                    highlighted: data.highlighted,
                    archived: data.archived,
                    attachmentUrls: data.attachmentUrls,
                    subject: data.subject,
                    type: data.type,
                    receivedDate: this.transformTimestamp(data.receivedDate),
                    sentDate: this.transformTimestamp(data.sentDate),
                    readDate: this.transformTimestamp(data.readDate),
                });
            });

            if (userMessages.length === 0) {
                const responseDto = new GetMessagesByUserResponseDto(
                    404,
                    'MESSAGESNOTFOUND',
                    userMessages
                );

                console.log('No received messages found.');
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                200,
                'MESSAGESRETRIEVEDSUCCESSFULLY',
                userMessages
            );

            console.log('Received messages fetched successfully.');
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }


    
    @ApiOperation({ summary: 'Get sent messages for a user' })
    @ApiOkResponse({ description: 'Sent messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @ApiNotFoundResponse({ description: 'No messages found', type: NotFoundException })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getSentMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            // Query for senderEmail and isActive
            const senderMessagesQuery = query(
                messageRef,
                where('senderEmail', '==', userEmail),
                where('active', '==', true)
            );
            const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

            const userMessages = [];

            // Add messages from sender
            senderMessagesQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                userMessages.push({
                    id: data.id,
                    senderEmail: data.senderEmail,
                    recipientEmail: data.recipientEmail,
                    content: data.content,
                    read: data.read,
                    archived: data.archived,
                    highlighted: data.highlighted,
                    attachmentUrls: data.attachmentUrls,
                    subject: data.subject,
                    type: data.type,
                    receivedDate: this.transformTimestamp(data.receivedDate),
                    sentDate: this.transformTimestamp(data.sentDate),
                    readDate: this.transformTimestamp(data.readDate),
                });
            });

            if (userMessages.length === 0) {
                const responseDto = new GetMessagesByUserResponseDto(
                    404,
                    'MESSAGESNOTFOUND',
                    userMessages
                );

                console.log('No sent messages found.');
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                200,
                'MESSAGESRETRIEVEDSUCCESSFULLY',
                userMessages
            );

            console.log('Sent messages fetched successfully.');
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }





    @ApiOperation({ summary: 'Search messages by keywords for a user' })
    @ApiOkResponse({ description: 'Messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @ApiNotFoundResponse({ description: 'No matching messages found', type: GetMessagesByUserResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async searchMessagesByKeywords(userId: string, keywords: string | string[]): Promise<GetMessagesByUserResponseDto> {
        try {
            console.log(`User ID: ${userId}`);
            console.log('Starting searchMessagesByKeywords function...');

            // Query for user's email based on userId
            const usersRef = collection(this.firebaseService.fireStore, 'users');
            const userQuery = query(usersRef, where('id', '==', userId));
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                console.log('User not found.');
                const responseDto = new GetMessagesByUserResponseDto(404, 'USERNOTFOUND', []);
                return responseDto;
            }

            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();
            const userEmail = userData.email;

            console.log(`User email: ${userEmail}`);

            // Query for messages
            const messageRef = collection(this.firebaseService.fireStore, 'messages');
            const messagesSnapshot = await getDocs(messageRef);

            const matchedMessages = [];

            messagesSnapshot.forEach((doc) => {
                const message = doc.data();
                const messageContent = message.content.toLowerCase();
                const messageSubject = message.subject.toLowerCase();

                const searchKeywords = Array.isArray(keywords) ? keywords : [keywords];

                const matchedKeywords = searchKeywords.filter(keyword => {
                    return messageContent.includes(keyword.toLowerCase()) || messageSubject.includes(keyword.toLowerCase());
                });

                if (
                    matchedKeywords.length > 0 &&
                    (message.senderEmail === userEmail || message.recipientEmail === userEmail) &&
                    message.active === true
                ) {
                    matchedMessages.push({
                        id: message.id,
                        senderEmail: message.senderEmail,
                        recipientEmail: message.recipientEmail,
                        content: message.content,
                        read: message.read,
                        archived: message.archived,
                        highlighted: message.highlighted,
                        attachmentUrls: message.attachmentUrls,
                        subject: message.subject,
                        type: message.type,
                        receivedDate: this.transformTimestamp(message.receivedDate),
                        sentDate: this.transformTimestamp(message.sentDate),
                        readDate: this.transformTimestamp(message.readDate),
                    });
                }
            });

            if (matchedMessages.length === 0) {
                const responseDto = new GetMessagesByUserResponseDto(
                    404,
                    'MESSAGESNOTFOUND',
                    matchedMessages
                );

                console.log('No matching messages found.');
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                200,
                'MESSAGESRETRIEVEDSUCCESSFULLY',
                matchedMessages
            );

            console.log('Matching messages fetched successfully.');
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }





    



  



    async updateMessageStatus(id: string, dto: UpdateMessageStatusDto): Promise<UpdateMessageStatusResponseDto> {
        try {
            const { read, type, archived, active, highlighted } = dto;
            const messagesCollectionRef = collection(this.firebaseService.fireStore, 'messages');
            const messagesQuery = query(messagesCollectionRef, where('id', '==', id));
            const messagesQuerySnapshot = await getDocs(messagesQuery);

            if (messagesQuerySnapshot.empty) {
                console.log('No messages found for the given ID.');
                const response: UpdateMessageStatusResponseDto = {
                    statusCode: 404,
                    message: 'MESSAGE NOT FOUND',
                };

                return response;            }

            const messageDocRef = messagesQuerySnapshot.docs[0].ref;

            const currentTimestamp = new Date();

            const messageDocSnapshot = await getDoc(messageDocRef);
            const messageData = messageDocSnapshot.data();

            const updateData: any = {
                read: read !== undefined ? read : messageData.read,
                type: type !== undefined ? type : messageData.type,
                archived: archived !== undefined ? archived : messageData.archived,
                active: active !== undefined ? active : messageData.active,
                highlighted: highlighted !== undefined ? highlighted : messageData.highlighted,
            };

            if (read) {
                updateData.readDate = currentTimestamp;
            } else {
                updateData.readDate = null;
            }

            await updateDoc(messageDocRef, updateData);

            console.log('Updated message status for the given ID.');

            const response: UpdateMessageStatusResponseDto = {
                statusCode: 200,
                message: 'MESSAGESTATUSSETSUCCESSFULLY',
            };

            return response;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error updating the message status.');
        }
    }













    @ApiOperation({ summary: 'Get filtered messages for a user. Valid Filters: read, unread, archived, inquiry, sent, received, complaint, highlight, eliminated' })
    @ApiOkResponse({ description: 'Filtered messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiNotFoundResponse({ description: 'No messages found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getFilteredMessages(filter: string, userId: string ): Promise<GetMessagesByUserResponseDto> {
        console.log('Filter:', filter);
        console.log('User ID:', userId);

        // Query for user's email based on userId
        const usersRef = collection(this.firebaseService.fireStore, 'users');
        const userQuery = query(usersRef, where('id', '==', userId));
        const userQuerySnapshot = await getDocs(userQuery);

        if (userQuerySnapshot.empty) {
            console.log('User not found.');
            const responseDto = new GetMessagesByUserResponseDto(404, 'USERNOTFOUND', []);
            return responseDto;
        }

        const userDoc = userQuerySnapshot.docs[0];
        const userData = userDoc.data();
        const email = userData.email;

        console.log(`User email: ${email}`);        switch (filter) {
            case 'read':
                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');
                    const readMessagesQuery = query(
                        messageRef,
                        where('read', '==', true),
                        where('recipientEmail', '==', email)
                    );

                    const readMessagesSnapshot = await getDocs(readMessagesQuery);
                    const readMessages = [];

                    readMessagesSnapshot.forEach((doc) => {
                        const message = doc.data();
                        if (message.active === true) {
                            readMessages.push({
                                id: message.id,
                                senderEmail: message.senderEmail,
                                recipientEmail: message.recipientEmail,
                                content: message.content,
                                archived: message.archived,
                                highlighted: message.highlighted,
                                active: message.active,
                                tags: message.tags,
                                attachmentUrls: message.attachmentUrls,
                                subject: message.subject,
                                type: message.type,
                                receivedDate: this.transformTimestamp(message.receivedDate),
                                sentDate: this.transformTimestamp(message.sentDate),
                                readDate: this.transformTimestamp(message.readDate),
                            });
                        }
                    });

                    if (readMessages.length === 0) {
                        const responseDto = new GetMessagesByUserResponseDto(
                            404,
                            'READMESSAGESNOTFOUND',
                            readMessages
                        );
                        return responseDto;
                    }

                    const responseDto = new GetMessagesByUserResponseDto(
                        200,
                        'READMESSAGESRETRIEVEDSUCCESSFULLY',
                        readMessages
                    );
                    return responseDto;
                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    throw new InternalServerErrorException('INTERNALERROR');
                }

            case 'unread':
                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');
                    const unreadMessagesQuery = query(
                        messageRef,
                        where('read', '==', false),
                        where('recipientEmail', '==', email)
                    );

                    const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
                    const unreadMessages = [];

                    unreadMessagesSnapshot.forEach((doc) => {
                        const message = doc.data();
                        if (message.active === true) {
                            unreadMessages.push({
                                id: message.id,
                                tags: message.tags,
                                highlighted: message.highlighted,
                                senderEmail: message.senderEmail,
                                recipientEmail: message.recipientEmail,
                                content: message.content,
                                archived: message.archived,
                                attachmentUrls: message.attachmentUrls,
                                subject: message.subject,
                                type: message.type,
                                active: message.active,
                                receivedDate: this.transformTimestamp(message.receivedDate),
                                sentDate: this.transformTimestamp(message.sentDate),
                                readDate: this.transformTimestamp(message.readDate),
                            });
                        }
                    });

                    if (unreadMessages.length === 0) {
                        const responseDto = new GetMessagesByUserResponseDto(
                            404,
                            'UNREADMESSAGESNOTFOUND',
                            unreadMessages
                        );
                        return responseDto;
                    }

                    const responseDto = new GetMessagesByUserResponseDto(
                        200,
                        'UNREADMESSAGESRETRIEVEDSUCCESSFULLY',
                        unreadMessages
                    );
                    return responseDto;
                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    throw new InternalServerErrorException('INTERNALERROR');
                }


            case 'archived':
                try {
                    console.log("Fetching archived messages...");
                    const archivedMessagesResponse = await this.getArchivedMessages(email);
                    const archivedMessages = archivedMessagesResponse.messagesFound;

                    console.log(`Archived messages found: ${archivedMessages.length}`);

                    if (archivedMessages.length === 0) {
                        console.log("No archived messages found.");
                        const responseDto = new GetMessagesByUserResponseDto(
                            404,
                            'ARCHIVEDMESSAGESNOTFOUND',
                            archivedMessages
                        );
                        return responseDto;
                    }

                    console.log("Archived messages retrieved successfully.");
                    const responseDto = new GetMessagesByUserResponseDto(
                        200,
                        'ARCHIVEDMESSAGESRETRIEVEDSUCCESSFULLY',
                        archivedMessages
                    );
                    return responseDto;
                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    throw new InternalServerErrorException('INTERNALERROR');
                }


            case 'inquiry':

                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    // Query for senderEmail and isActive
                    const senderMessagesQuery = query(
                        messageRef,
                        where('senderEmail', '==', email),
                        where('active', '==', true)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    // Query for recipientEmail and isActive
                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('active', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userInquiryMessages = [];

                    // Add Inquiry messages from sender
                    senderMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.type === MessageType.Inquiry) {
                            userInquiryMessages.push({
                                id: data.id,
                                tags: data.tags,
                                highlighted: data.highlighted,
                                senderEmail: data.senderEmail,
                                recipientEmail: data.recipientEmail,
                                content: data.content,
                                read: data.read,
                                archived: data.archived,
                                attachmentUrls: data.attachmentUrls,
                                subject: data.subject,
                                type: data.type,
                                receivedDate: this.transformTimestamp(data.receivedDate),
                                sentDate: this.transformTimestamp(data.sentDate),
                                readDate: this.transformTimestamp(data.readDate),
                            });
                        }
                    });

                    // Add Inquiry messages from recipient
                    recipientMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.type === MessageType.Inquiry) {
                            userInquiryMessages.push({
                                id: data.id,
                                tags: data.tags,
                                highlighted: data.highlighted,
                                senderEmail: data.senderEmail,
                                recipientEmail: data.recipientEmail,
                                content: data.content,
                                read: data.read,
                                archived: data.archived,
                                attachmentUrls: data.attachmentUrls,
                                subject: data.subject,
                                type: data.type,
                                receivedDate: this.transformTimestamp(data.receivedDate),
                                sentDate: this.transformTimestamp(data.sentDate),
                                readDate: this.transformTimestamp(data.readDate),
                            });
                        }
                    });

                    if (userInquiryMessages.length === 0) {
                        const responseDto = new GetMessagesByUserResponseDto(
                            404,
                            'INQUIRYMESSAGESNOTFOUND',
                            userInquiryMessages
                        );

                        console.log('No Inquiry messages found.');
                        return responseDto;
                    }

                    const responseDto = new GetMessagesByUserResponseDto(
                        200,
                        'INQUIRYMESSAGESRETRIEVEDSUCCESSFULLY',
                        userInquiryMessages
                    );

                    console.log('User Inquiry messages fetched successfully.');
                    return responseDto;
                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    throw new InternalServerErrorException('INTERNALERROR');
                }

            case 'sent':

                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    // Query for senderEmail and isActive
                    const senderMessagesQuery = query(
                        messageRef,
                        where('senderEmail', '==', email),
                        where('active', '==', true)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    const userMessages = [];

                    // Add messages from sender
                    senderMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        userMessages.push({
                            id: data.id,
                            tags: data.tags,
                            highlighted: data.highlighted,
                            senderEmail: data.senderEmail,
                            recipientEmail: data.recipientEmail,
                            content: data.content,
                            read: data.read,
                            archived: data.archived,
                            attachmentUrls: data.attachmentUrls,
                            subject: data.subject,
                            type: data.type,
                            receivedDate: this.transformTimestamp(data.receivedDate),
                            sentDate: this.transformTimestamp(data.sentDate),
                            readDate: this.transformTimestamp(data.readDate),
                        });
                    });

                    if (userMessages.length === 0) {
                        const responseDto = new GetMessagesByUserResponseDto(
                            404,
                            'MESSAGESNOTFOUND',
                            userMessages
                        );

                        console.log('No sent messages found.');
                        return responseDto;
                    }

                    const responseDto = new GetMessagesByUserResponseDto(
                        200,
                        'MESSAGESRETRIEVEDSUCCESSFULLY',
                        userMessages
                    );

                    console.log('Sent messages fetched successfully.');
                    return responseDto;
                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    throw new InternalServerErrorException('INTERNALERROR');
                }


            case 'received':

                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    // Query for recipientEmail and isActive
                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('active', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userMessages = [];

                    // Add messages from recipient
                    recipientMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        userMessages.push({
                            id: data.id,
                            tags: data.tags,
                            highlighted: data.highlighted,
                            senderEmail: data.senderEmail,
                            recipientEmail: data.recipientEmail,
                            content: data.content,
                            read: data.read,
                            archived: data.archived,
                            attachmentUrls: data.attachmentUrls,
                            subject: data.subject,
                            type: data.type,
                            receivedDate: this.transformTimestamp(data.receivedDate),
                            sentDate: this.transformTimestamp(data.sentDate),
                            readDate: this.transformTimestamp(data.readDate),
                        });
                    });

                    if (userMessages.length === 0) {
                        const responseDto = new GetMessagesByUserResponseDto(
                            404,
                            'MESSAGESNOTFOUND',
                            userMessages
                        );

                        console.log('No received messages found.');
                        return responseDto;
                    }

                    const responseDto = new GetMessagesByUserResponseDto(
                        200,
                        'MESSAGESRETRIEVEDSUCCESSFULLY',
                        userMessages
                    );

                    console.log('Received messages fetched successfully.');
                    return responseDto;
                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    throw new InternalServerErrorException('INTERNALERROR');
                }

            case 'complaint': 

                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    // Query for senderEmail and isActive
                    const senderMessagesQuery = query(
                        messageRef,
                        where('senderEmail', '==', email),
                        where('active', '==', true)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    // Query for recipientEmail and isActive
                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('active', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userComplaintMessages = [];

                    // Add Complaint messages from sender
                    senderMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.type === MessageType.Complaint) {
                            userComplaintMessages.push({
                                id: data.id,
                                tags: data.tags,
                                highlighted: data.highlighted,
                                senderEmail: data.senderEmail,
                                recipientEmail: data.recipientEmail,
                                content: data.content,
                                read: data.read,
                                archived: data.archived,
                                attachmentUrls: data.attachmentUrls,
                                subject: data.subject,
                                type: data.type,
                                receivedDate: this.transformTimestamp(data.receivedDate),
                                sentDate: this.transformTimestamp(data.sentDate),
                                readDate: this.transformTimestamp(data.readDate),
                            });
                        }
                    });

                    // Add Complaint messages from recipient
                    recipientMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.type === MessageType.Complaint) {
                            userComplaintMessages.push({
                                id: data.id,
                                tags: data.tags,
                                highlighted: data.highlighted,
                                senderEmail: data.senderEmail,
                                recipientEmail: data.recipientEmail,
                                content: data.content,
                                read: data.read,
                                archived: data.archived,
                                attachmentUrls: data.attachmentUrls,
                                subject: data.subject,
                                type: data.type,
                                receivedDate: this.transformTimestamp(data.receivedDate),
                                sentDate: this.transformTimestamp(data.sentDate),
                                readDate: this.transformTimestamp(data.readDate),
                            });
                        }
                    });

                    if (userComplaintMessages.length === 0) {
                        const responseDto = new GetMessagesByUserResponseDto(
                            404,
                            'COMPLAINTMESSAGESNOTFOUND',
                            userComplaintMessages
                        );

                        console.log('No Complaint messages found.');
                        return responseDto;
                    }

                    const responseDto = new GetMessagesByUserResponseDto(
                        200,
                        'COMPLAINTMESSAGESRETRIEVEDSUCCESSFULLY',
                        userComplaintMessages
                    );

                    console.log('User Complaint messages fetched successfully.');
                    return responseDto;
                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    throw new InternalServerErrorException('INTERNALERROR');
                }

            case 'highlighted':
                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');


                    // Query for recipientEmail and isActive
                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('active', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const highlightedMessages = [];

                   

                    // Add Highlighted messages from recipient
                    recipientMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.highlighted === true) {
                            highlightedMessages.push({
                                id: data.id,
                                tags: data.tags,
                                highlighted: data.highlighted,
                                senderEmail: data.senderEmail,
                                recipientEmail: data.recipientEmail,
                                content: data.content,
                                read: data.read,
                                archived: data.archived,
                                attachmentUrls: data.attachmentUrls,
                                subject: data.subject,
                                type: data.type,
                                receivedDate: this.transformTimestamp(data.receivedDate),
                                sentDate: this.transformTimestamp(data.sentDate),
                                readDate: this.transformTimestamp(data.readDate),
                            });
                        }
                    });

                    if (highlightedMessages.length === 0) {
                        const responseDto = new GetMessagesByUserResponseDto(
                            404,
                            'HIGHLIGHTEDMESSAGESNOTFOUND',
                            highlightedMessages
                        );

                        console.log('No Highlighted messages found.');
                        return responseDto;
                    }

                    const responseDto = new GetMessagesByUserResponseDto(
                        200,
                        'HIGHLIGHTEDMESSAGESRETRIEVEDSUCCESSFULLY',
                        highlightedMessages
                    );

                    console.log('Highlighted messages fetched successfully.');
                    return responseDto;
                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    throw new InternalServerErrorException('INTERNALERROR');
                }

            case 'deleted':
                try {
                    console.log('User Email:', email);
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    // Query for senderEmail with isActive = false
                    const senderMessagesQuery = query(
                        messageRef,
                        where('senderEmail', '==', email),
                        where('active', '==', false)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    // Query for recipientEmail with isActive = false
                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('active', '==', false)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userEliminatedMessages = [];

                    // Add messages from sender
                    senderMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        userEliminatedMessages.push({
                            id: data.id,
                            tags: data.tags,
                            highlighted: data.highlighted,
                            senderEmail: data.senderEmail,
                            recipientEmail: data.recipientEmail,
                            content: data.content,
                            read: data.read,
                            archived: data.archived,
                            attachmentUrls: data.attachmentUrls,
                            subject: data.subject,
                            type: data.type,
                            receivedDate: this.transformTimestamp(data.receivedDate),
                            sentDate: this.transformTimestamp(data.sentDate),
                            readDate: this.transformTimestamp(data.readDate),
                        });
                    });

                    // Add messages from recipient
                    recipientMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        userEliminatedMessages.push({
                            id: data.id,
                            tags: data.tags,
                            highlighted: data.highlighted,
                            senderEmail: data.senderEmail,
                            recipientEmail: data.recipientEmail,
                            content: data.content,
                            read: data.read,
                            archived: data.archived,
                            attachmentUrls: data.attachmentUrls,
                            subject: data.subject,
                            type: data.type,
                            receivedDate: this.transformTimestamp(data.receivedDate),
                            sentDate: this.transformTimestamp(data.sentDate),
                            readDate: this.transformTimestamp(data.readDate),
                        });
                    });

                    if (userEliminatedMessages.length === 0) {
                        const responseDto = new GetMessagesByUserResponseDto(
                            404,
                            'MESSAGESNOTFOUND',
                            userEliminatedMessages
                        );

                        console.log('No eliminated messages found.');
                        return responseDto;
                    }

                    const responseDto = new GetMessagesByUserResponseDto(
                        200,
                        'MESSAGESRETRIEVEDSUCCESSFULLY',
                        userEliminatedMessages
                    );

                    console.log('Eliminated messages fetched successfully.');
                    return responseDto;
                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    throw new InternalServerErrorException('INTERNALERROR');
                }
        


              default:
                return new GetMessagesByUserResponseDto(400, 'INVALIDFILTER', []);
        }
    }



    @ApiBadRequestResponse({ description: 'Bad request or not found', type: NotFoundException })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async addOrRemoveTagsFromMessage(id: string, action: 'add' | 'delete', tagsIds: string[]): Promise<AddTagsResponseDto> {
        try {
            console.log(`Adding or removing tags from a message based on action: ${action}...`);

            // Query the message collection with ID condition
            const messagesCollectionRef = collection(this.firebaseService.fireStore, 'messages');
            const messagesQuery = query(messagesCollectionRef, where('id', '==', id));
            const messagesQuerySnapshot = await getDocs(messagesQuery);

            if (messagesQuerySnapshot.empty) {
                const responseDto: AddTagsResponseDto = {
                    statusCode: 404,
                    message: 'MESSAGES NOT FOUND',
                };

                return responseDto;            }

            const messageDocRef = messagesQuerySnapshot.docs[0].ref;
            const messageDocSnapshot = await getDoc(messageDocRef);
            const currentTags = messageDocSnapshot.data()?.tags || [];

            let updatedTags: string[] = [...currentTags];

            if (action === 'add') {
                for (const tagId of tagsIds) {
                    const tagsCollectionRef = collection(this.firebaseService.fireStore, 'tags');
                    const tagQuery = query(tagsCollectionRef, where('id', '==', tagId));
                    const tagQuerySnapshot = await getDocs(tagQuery);

                    if (!tagQuerySnapshot.empty) {
                        const tagName = tagQuerySnapshot.docs[0].data()?.name;
                        if (tagName) {
                            updatedTags.push(tagName);
                        }
                    }

                    else if (tagQuerySnapshot.empty) {
                        const responseDto: AddTagsResponseDto = {
                            statusCode: 404,
                            message: 'TAGS NOT FOUND',
                        };

                        return responseDto;
                    }
                }
            } else if (action === 'delete') {
                for (const tagId of tagsIds) {
                    const tagsCollectionRef = collection(this.firebaseService.fireStore, 'tags');
                    const tagQuery = query(tagsCollectionRef, where('id', '==', tagId));
                    const tagQuerySnapshot = await getDocs(tagQuery);

                    if (!tagQuerySnapshot.empty) {
                        const tagName = tagQuerySnapshot.docs[0].data()?.name;
                        if (tagName) {
                            updatedTags = updatedTags.filter(tag => tag !== tagName);
                        }
                    } else if (tagQuerySnapshot.empty) {
                        const responseDto: AddTagsResponseDto = {
                            statusCode: 404,
                            message: 'TAGS NOT FOUND',
                        };

                        return responseDto;    
                    }
                }
            } else {
                throw new Error('Invalid action. Supported actions: add, delete');
            }

            await updateDoc(messageDocRef, { tags: updatedTags });

            console.log('Tags added or removed from the message.');

            const responseDto: AddTagsResponseDto = {
                statusCode: 200,
                message: 'TAGSADDEDREMOVEDSUCCESSFULLY',
            };
            console.log('Tags added or removed from the message successfully.');

            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }







    @ApiOperation({ summary: 'Search messages by tags for a user' })
    @ApiOkResponse({ description: 'Messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @ApiNotFoundResponse({ description: 'No matching messages found', type: GetMessagesByUserResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async searchMessagesByTags(userId: string, tags: string[]): Promise<GetMessagesByUserResponseDto> {
        try {
            const usersRef = collection(this.firebaseService.fireStore, 'users');
            const userQuerySnapshot = await getDocs(query(usersRef, where('id', '==', userId)));

            if (userQuerySnapshot.empty) {
                const responseDto = new GetMessagesByUserResponseDto(404, 'USERNOTFOUND', []);
                return responseDto;
            }

            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();
            const userEmail = userData.email;

            const messageRef = collection(this.firebaseService.fireStore, 'messages');
            const messagesSnapshot = await getDocs(messageRef);

            const matchedMessages = [];

            messagesSnapshot.forEach((doc) => {
                const message = doc.data();
                const messageTags = message.tags || [];

                const matchedTags = (Array.isArray(tags) ? tags : [tags]).filter(tag => messageTags.includes(tag));

                if (
                    matchedTags.length > 0 &&
                    (message.senderEmail === userEmail || message.recipientEmail === userEmail) &&
                    message.active === true
                ) {
                    matchedMessages.push({
                        id: message.id,
                        senderEmail: message.senderEmail,
                        recipientEmail: message.recipientEmail,
                        content: message.content,
                        read: message.read,
                        archived: message.archived,
                        attachmentUrls: message.attachmentUrls,
                        subject: message.subject,
                        type: message.type,
                        receivedDate: this.transformTimestamp(message.receivedDate),
                        sentDate: this.transformTimestamp(message.sentDate),
                        readDate: this.transformTimestamp(message.readDate),
                    });
                }
            });

            if (matchedMessages.length === 0) {
                const responseDto = new GetMessagesByUserResponseDto(
                    404,
                    'MESSAGESNOTFOUND',
                    matchedMessages
                );
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                200,
                'MESSAGESRETRIEVEDSUCCESSFULLY',
                matchedMessages
            );
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }






    async getMessageById(messageId: string): Promise<GetMessageByIdResponseDto> {
        try {
            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            const messageQuery = query(
                messageRef,
                where('id', '==', messageId)
            );

            const messageQuerySnapshot = await getDocs(messageQuery);

            if (messageQuerySnapshot.empty) {
                const response: GetMessageByIdResponseDto = {
                    statusCode: 404,
                    message: 'MESSAGE NOT FOUND',
                    senderPicture: null,
                    username: null,
                    messageFound: null
                }

                return response;

            }

            const messageDoc = messageQuerySnapshot.docs[0];
            const messageData = messageDoc.data();


            const userRef = collection(this.firebaseService.fireStore, 'users');
            const userQuery = query(
                userRef,
                where('email', '==', messageData.senderEmail)
            );

            const userQuerySnapshot = await getDocs(userQuery);

            let profilePicture: string | null = null;
            let username: string | null = null;


            if (!userQuerySnapshot.empty) {
                const userDoc = userQuerySnapshot.docs[0];
                const userData = userDoc.data();
                profilePicture = userData.profilePicture;
                username = userData.username;

            }




            const messageDto: GetMessageByIdResponseDto = {
                statusCode: 200,
                message: 'MESSAGERETRIEVEDSUCCESSFULLY',
                senderPicture: profilePicture,
                username: username,
                messageFound: {
                    id: messageData.id,
                    senderEmail: messageData.senderEmail,
                    recipientEmail: messageData.recipientEmail,
                    content: messageData.content,
                    read: messageData.read,
                    highlighted: messageData.highlighted,
                    archived: messageData.archived,
                    attachmentUrls: messageData.attachmentUrls,
                    subject: messageData.subject,
                    type: messageData.type,
                    receivedDate: this.transformTimestamp(messageData.receivedDate),
                    sentDate: this.transformTimestamp(messageData.sentDate),
                    readDate: this.transformTimestamp(messageData.readDate),
                    tags: messageData.tags
                },
            };

            return messageDto;
        } catch (error: unknown) {
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }














    transformTimestamp(timestamp: any): string {
        if (timestamp && typeof timestamp === 'object' && timestamp.seconds && timestamp.nanoseconds) {
            const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

            const year = date.getUTCFullYear();
            const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
            const day = ('0' + date.getUTCDate()).slice(-2);
            const hours = ('0' + date.getUTCHours()).slice(-2);
            const minutes = ('0' + date.getUTCMinutes()).slice(-2);
            const seconds = ('0' + date.getUTCSeconds()).slice(-2);

            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            return formattedDate;
        }
        return '';
    }










}