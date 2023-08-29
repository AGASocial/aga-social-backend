import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, QueryFieldFilterConstraint, Timestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { FirebaseService } from "../firebase/firebase.service";
import { CreateMessageDto, MessageType } from "./dto/createMessage.dto";
import { CreateMessageResponseDto } from "./dto/createMessageResponse.dto";
import { DeleteMessageDto } from "./dto/deleteMessage.dto";
import { DeleteMessageResponseDto } from "./dto/deleteMessageResponse.dto";
import { GetMessagesByKeywordsDto } from "./dto/getMessagesByKeywords.dto";
import { GetMessagesByUserResponseDto } from "./dto/getMessagesByUserResponse.dto";
import { MarkAsArchivedDto } from "./dto/markAsArchived.dto";
import { MarkAsArchivedResponseDto } from "./dto/markAsArchivedResponse.dto";
import { MarkAsReadDto } from "./dto/markAsRead.dto";
import { MarkAsReadResponseDto } from "./dto/markAsReadResponse.dto";
import { UpdateMessageStatusDto } from "./dto/updateMessageStatus.dto";
import { UpdateMessageStatusResponseDto } from "./dto/updateMessageStatusResponse.dto";
import * as admin from 'firebase-admin';
import {GetMessagesFilteredDto } from "./dto/getMessagesFiltered.dto";
import { DocResult } from "../utils/docResult.entity";
import { v4 as uuidv4 } from 'uuid';
import { AddTagsResponseDto } from "./dto/addTagsResponse.dto";
import { Message } from "./entities/message.entity";




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
                where('isArchived', '==', true),
                where('recipientEmail', '==', userEmail)
            );

            const archivedMessagesSnapshot = await getDocs(archivedMessagesQuery);
            const archivedMessages = [];

            archivedMessagesSnapshot.forEach((doc) => {
                const message = doc.data();
                if (message.isActive === true) {
                    archivedMessages.push({
                        senderEmail: message.senderEmail,
                        recipientEmail: message.recipientEmail,
                        content: message.content,
                        isRead: message.isRead,
                        isHighlight: message.isHighlight,
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
                where('isRead', '==', true),
                where('recipientEmail', '==', userEmail)
            );

            const readMessagesSnapshot = await getDocs(readMessagesQuery);
            const readMessages = [];

            readMessagesSnapshot.forEach((doc) => {
                const message = doc.data();
                if (message.isActive === true) {
                    readMessages.push({
                        isHighlight: message.isHighlight,
                        senderEmail: message.senderEmail,
                        recipientEmail: message.recipientEmail,
                        content: message.content,
                        isArchived: message.isArchived,
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
                where('isRead', '==', false),
                where('recipientEmail', '==', userEmail)
            );

            const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
            const unreadMessages = [];

            unreadMessagesSnapshot.forEach((doc) => {
                const message = doc.data();
                if (message.isActive === true) {
                    unreadMessages.push({
                        senderEmail: message.senderEmail,
                        recipientEmail: message.recipientEmail,
                        content: message.content,
                        isArchived: message.isArchived,
                        isHighlight: message.isHighlight,
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

            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            const currentDate = new Date();
            const receivedDate = new Date(currentDate.getTime() + 30000); 
            const newMessageId: string = uuidv4();


            const newMessage = {
                senderEmail,
                id: newMessageId,
                recipientEmail,
                content,
                isRead: false,
                isArchived: false,
                attachmentUrls: attachmentUrls || [],
                subject,
                type,
                sentDate: currentDate,
                receivedDate: receivedDate,
                readDate: null,
                isActive: true,
                isHighlight: false,
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
                isRead: false,
                isArchived: false,
                sentDate: currentDate,
                receivedDate: currentDate,
                readDate: null,
                isActive: true,
                isHighlight: false,



            });
            this.firebaseService.setCollectionData('messages', cachedMessages);
            console.log('Message added to cache successfully.');

            console.log('Message created and sent successfully.');
            const responseDto = new CreateMessageResponseDto(201, 'MESSAGECREATEDSUCCESSFULLY');
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }





    //NOT IN USE
    /*
    @ApiOperation({ summary: 'Delete a message' })
    @ApiOkResponse({ description: 'Message deleted successfully', type: DeleteMessageResponseDto })
    @ApiBadRequestResponse({ description: 'Message not found', type: NotFoundException })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async deleteMessage(deleteMessageDto: DeleteMessageDto): Promise<DeleteMessageResponseDto> {
        try {
            const { senderEmail, recipientEmail, subject } = deleteMessageDto;

            const messageRef = collection(this.firebaseService.fireStore, 'messages');
            const messageQuerySnapshot = await getDocs(query(
                messageRef,
                where('senderEmail', '==', senderEmail),
                where('recipientEmail', '==', recipientEmail),
                where('subject', '==', subject),
            ));

            if (messageQuerySnapshot.empty) {
                console.log(`Message not found.`);
                throw new NotFoundException('MESSAGENOTFOUND');
            }
            const messageDoc = messageQuerySnapshot.docs[0];

            await deleteDoc(messageDoc.ref);

            const cachedMessages = await this.firebaseService.getCollectionData('messages');
            const indexToDelete = cachedMessages.findIndex((message) =>
                message.senderEmail === senderEmail &&
                message.recipientEmail === recipientEmail &&
                message.subject === subject
            );

            if (indexToDelete !== -1) {
                cachedMessages.splice(indexToDelete, 1);
                this.firebaseService.setCollectionData('messages', cachedMessages);
            }

            const response: DeleteMessageResponseDto = {
                statusCode: 200,
                message: 'MESSAGEDELETEDSUCCESSFULLY',
            };

            console.log(`The message has been deleted successfully.`);
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }*/


    @ApiOperation({ summary: 'Get messages for a user' })
    @ApiOkResponse({ description: 'User messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @ApiNotFoundResponse({ description: 'No messages found', type: NotFoundException })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getUserMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
            console.log('User Email:', userEmail);
            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            // Query for senderEmail
            const senderMessagesQuery = query(
                messageRef,
                where('senderEmail', '==', userEmail),
                where('isActive', '==', true)
            );
            const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

            // Query for recipientEmail
            const recipientMessagesQuery = query(
                messageRef,
                where('recipientEmail', '==', userEmail),
                where('isActive', '==', true)
            );
            const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

            const userMessages = [];

            // Add messages from sender
            senderMessagesQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                userMessages.push({
                    senderEmail: data.senderEmail,
                    recipientEmail: data.recipientEmail,
                    content: data.content,
                    isRead: data.isRead,
                    isArchived: data.isArchived,
                    isHighlight: data.isHighlight,
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
                    senderEmail: data.senderEmail,
                    recipientEmail: data.recipientEmail,
                    content: data.content,
                    isRead: data.isRead,
                    isArchived: data.isArchived,
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
                where('isActive', '==', true)
            );
            const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

            const userMessages = [];

            // Add messages from recipient
            recipientMessagesQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                userMessages.push({
                    senderEmail: data.senderEmail,
                    recipientEmail: data.recipientEmail,
                    content: data.content,
                    isRead: data.isRead,
                    isHighlight: data.isHighlight,
                    isArchived: data.isArchived,
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
                where('isActive', '==', true)
            );
            const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

            const userMessages = [];

            // Add messages from sender
            senderMessagesQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                userMessages.push({
                    senderEmail: data.senderEmail,
                    recipientEmail: data.recipientEmail,
                    content: data.content,
                    isRead: data.isRead,
                    isArchived: data.isArchived,
                    isHighlight: data.isHighlight,
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
    async searchMessagesByKeywords(email: string, keywords: string[]): Promise<GetMessagesByUserResponseDto> {
        try {

            const usersRef = collection(this.firebaseService.fireStore, 'users');

            const customUserWhere = where('email', '==', email);
            const userQuery = query(usersRef, customUserWhere);

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
            console.log('Starting searchMessagesByKeywords function...');

            const messageRef = collection(this.firebaseService.fireStore, 'messages');
            const messagesSnapshot = await getDocs(messageRef);

            const matchedMessages = [];

            messagesSnapshot.forEach((doc) => {
                const message = doc.data();
                const messageContent = message.content.toLowerCase();
                const messageSubject = message.subject.toLowerCase();

                console.log(`Processing message:`);
                const matchedKeywords = (Array.isArray(keywords) ? keywords : [keywords]).filter(keyword => {
                    return messageContent.includes(keyword.toLowerCase()) || messageSubject.includes(keyword.toLowerCase());
                });


                if (
                    matchedKeywords.length > 0 &&
                    (message.senderEmail === userEmail || message.recipientEmail === userEmail) &&
                    message.isActive === true
                ) {
                    console.log(`Matched keywords: ${matchedKeywords.join(', ')}`);

                    matchedMessages.push({
                        senderEmail: message.senderEmail,
                        recipientEmail: message.recipientEmail,
                        content: message.content,
                        isRead: message.isRead,
                        isArchived: message.isArchived,
                        isHighlight: message.isHighlight,
                        attachmentUrls: message.attachmentUrls,
                        subject: message.subject,
                        type: message.type,
                        receivedDate: this.transformTimestamp(message.receivedDate),
                        sentDate: this.transformTimestamp(message.sentDate),
                        readDate: this.transformTimestamp(message.readDate),
                    });
                }
            });

            console.log(`Matched messages`);

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
            const { isRead, type, isArchived, isActive, isHighlight } = dto;
            const messagesCollectionRef = collection(this.firebaseService.fireStore, 'messages');
            const messagesQuery = query(messagesCollectionRef, where('id', '==', id));
            const messagesQuerySnapshot = await getDocs(messagesQuery);

            if (messagesQuerySnapshot.empty) {
                console.log('No messages found for the given ID.');
                throw new NotFoundException('Message not found');
            }

            const messageDocRef = messagesQuerySnapshot.docs[0].ref;

            const currentTimestamp = new Date();

            const messageDocSnapshot = await getDoc(messageDocRef);
            const messageData = messageDocSnapshot.data();

            const updateData: any = {
                isRead: isRead !== undefined ? isRead : messageData.isRead,
                type: type !== undefined ? type : messageData.type,
                isArchived: isArchived !== undefined ? isArchived : messageData.isArchived,
                isActive: isActive !== undefined ? isActive : messageData.isActive,
                isHighlight: isHighlight !== undefined ? isHighlight : messageData.isHighlight,
            };

            if (isRead) {
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
    async getFilteredMessages(filter: string, email: string ): Promise<GetMessagesByUserResponseDto> {
        console.log('Filter:', filter);
        switch (filter) {
            case 'read':
                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');
                    const readMessagesQuery = query(
                        messageRef,
                        where('isRead', '==', true),
                        where('recipientEmail', '==', email)
                    );

                    const readMessagesSnapshot = await getDocs(readMessagesQuery);
                    const readMessages = [];

                    readMessagesSnapshot.forEach((doc) => {
                        const message = doc.data();
                        if (message.isActive === true) {
                            readMessages.push({
                                senderEmail: message.senderEmail,
                                recipientEmail: message.recipientEmail,
                                content: message.content,
                                isArchived: message.isArchived,
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
                        where('isRead', '==', false),
                        where('recipientEmail', '==', email)
                    );

                    const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
                    const unreadMessages = [];

                    unreadMessagesSnapshot.forEach((doc) => {
                        const message = doc.data();
                        if (message.isActive === true) {
                            unreadMessages.push({
                                senderEmail: message.senderEmail,
                                recipientEmail: message.recipientEmail,
                                content: message.content,
                                isArchived: message.isArchived,
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
                        where('isActive', '==', true)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    // Query for recipientEmail and isActive
                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('isActive', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userInquiryMessages = [];

                    // Add Inquiry messages from sender
                    senderMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.type === MessageType.Inquiry) {
                            userInquiryMessages.push({
                                senderEmail: data.senderEmail,
                                recipientEmail: data.recipientEmail,
                                content: data.content,
                                isRead: data.isRead,
                                isArchived: data.isArchived,
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
                                senderEmail: data.senderEmail,
                                recipientEmail: data.recipientEmail,
                                content: data.content,
                                isRead: data.isRead,
                                isArchived: data.isArchived,
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
                        where('isActive', '==', true)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    const userMessages = [];

                    // Add messages from sender
                    senderMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        userMessages.push({
                            senderEmail: data.senderEmail,
                            recipientEmail: data.recipientEmail,
                            content: data.content,
                            isRead: data.isRead,
                            isArchived: data.isArchived,
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
                        where('isActive', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userMessages = [];

                    // Add messages from recipient
                    recipientMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        userMessages.push({
                            senderEmail: data.senderEmail,
                            recipientEmail: data.recipientEmail,
                            content: data.content,
                            isRead: data.isRead,
                            isArchived: data.isArchived,
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
                        where('isActive', '==', true)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    // Query for recipientEmail and isActive
                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('isActive', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userComplaintMessages = [];

                    // Add Complaint messages from sender
                    senderMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.type === MessageType.Complaint) {
                            userComplaintMessages.push({
                                senderEmail: data.senderEmail,
                                recipientEmail: data.recipientEmail,
                                content: data.content,
                                isRead: data.isRead,
                                isArchived: data.isArchived,
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
                                senderEmail: data.senderEmail,
                                recipientEmail: data.recipientEmail,
                                content: data.content,
                                isRead: data.isRead,
                                isArchived: data.isArchived,
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

            case 'highlight':
                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');


                    // Query for recipientEmail and isActive
                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('isActive', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const highlightedMessages = [];

                   

                    // Add Highlighted messages from recipient
                    recipientMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.isHighlight === true) {
                            highlightedMessages.push({
                                senderEmail: data.senderEmail,
                                recipientEmail: data.recipientEmail,
                                content: data.content,
                                isRead: data.isRead,
                                isArchived: data.isArchived,
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

            case 'eliminated':
                try {
                    console.log('User Email:', email);
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    // Query for senderEmail with isActive = false
                    const senderMessagesQuery = query(
                        messageRef,
                        where('senderEmail', '==', email),
                        where('isActive', '==', false)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    // Query for recipientEmail with isActive = false
                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('isActive', '==', false)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userEliminatedMessages = [];

                    // Add messages from sender
                    senderMessagesQuerySnapshot.forEach((doc) => {
                        const data = doc.data();
                        userEliminatedMessages.push({
                            senderEmail: data.senderEmail,
                            recipientEmail: data.recipientEmail,
                            content: data.content,
                            isRead: data.isRead,
                            isArchived: data.isArchived,
                            isHighlight: data.isHighlight,
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
                            senderEmail: data.senderEmail,
                            recipientEmail: data.recipientEmail,
                            content: data.content,
                            isRead: data.isRead,
                            isArchived: data.isArchived,
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
    async addOrRemoveTagsFromMessage(id: string, action: 'add' | 'eliminate', tagsNames: string[]): Promise<AddTagsResponseDto> {
        try {
            console.log(`Adding or removing tags from a message based on action: ${action}...`);

            // Query the message collection with ID condition
            const messagesCollectionRef = collection(this.firebaseService.fireStore, 'messages');
            const messagesQuery = query(messagesCollectionRef, where('id', '==', id));
            const messagesQuerySnapshot = await getDocs(messagesQuery);

            if (messagesQuerySnapshot.empty) {
                throw new NotFoundException('Message not found');
            }

            const messageDocRef = messagesQuerySnapshot.docs[0].ref;
            const messageDocSnapshot = await getDoc(messageDocRef);
            const currentTags = messageDocSnapshot.data()?.tags || [];

            let updatedTags: string[] = [];

            if (action === 'add') {
                updatedTags = [...currentTags, ...tagsNames];
            } else if (action === 'eliminate') {
                updatedTags = currentTags.filter(tag => !tagsNames.includes(tag));
            } else {
                throw new Error('Invalid action. Supported actions: add, eliminate');
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
    async searchMessagesByTags(email: string, tags: string[]): Promise<GetMessagesByUserResponseDto> {
        try {
            const usersRef = collection(this.firebaseService.fireStore, 'users');
            const userQuerySnapshot = await getDocs(query(usersRef, where('email', '==', email)));

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
                    message.isActive === true
                ) {
                    matchedMessages.push({
                        senderEmail: message.senderEmail,
                        recipientEmail: message.recipientEmail,
                        content: message.content,
                        isRead: message.isRead,
                        isArchived: message.isArchived,
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