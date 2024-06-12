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
                    'error',
                    404,
                    'Archived messages not found.',
                    []
                );
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                'success',
                200,
                'Messages retrieved successfully.',
                archivedMessages
            );
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            const responseDto = new GetMessagesByUserResponseDto(
                'error',
                400,
                'Archived messages could not be retrieved.',
                []
            );
            return responseDto;
        }
    }





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
                    'error',
                    404,
                    'Read messages not found.',
                    []
                );
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                'success',
                200,
                'Messages retrieved successfully.',
                readMessages
            );
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            const responseDto = new GetMessagesByUserResponseDto(
                'error',
                400,
                'Read messages could not be retrieved.',
                []
            );
            return responseDto;
        }
    }





   
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
                    'error',
                    404,
                    'Unread messages not found.',
                    []
                );
                return responseDto;
            }

            const responseDto = new GetMessagesByUserResponseDto(
                'success',
                200,
                'Messages retrieved successfully.',
                unreadMessages
            );
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            const responseDto = new GetMessagesByUserResponseDto(
                'error',
                400,
                'Unread messages could not be retrieved.',
                []
            );
            return responseDto;
        }
    }






   
    async createAndSendMessage(createMessageDto: CreateMessageDto): Promise<CreateMessageResponseDto> {
        try {
            console.log('Creating and sending a new message...');

            const { senderEmail, recipientEmail, content, subject, type, attachmentUrls } = createMessageDto;

            const senderExists = await this.firebaseService.getUserByEmail(senderEmail);
            const recipientExists = await this.firebaseService.getUserByEmail(recipientEmail);

            if (!senderExists) {
                return new CreateMessageResponseDto('error', 404, 'Sender email not found', {});
            }

            if (!recipientExists) {
                return new CreateMessageResponseDto('error', 404, 'Recipient email not found', {});
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
                return new CreateMessageResponseDto('error', 400, 'There was an error obtaining the picture of the sender.', {});
            }

            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            const currentDate = new Date();
            const receivedDate = new Date(currentDate.getTime() + 30000);

            const newMessage = {
                senderEmail,
                recipientEmail,
                content,
                read: false,
                archived: false,
                attachmentUrls: attachmentUrls || [],
                subject,
                type,
                sentDate: currentDate,
                receivedDate,
                readDate: null,
                active: true,
                highlighted: false,
            };

            console.log('Creating new message...');

            const newMessageDocRef = await addDoc(messageRef, newMessage);
            const newMessageId = newMessageDocRef.id;

            await updateDoc(newMessageDocRef, { id: newMessageId });

            const cachedMessages = await this.firebaseService.getCollectionData('messages');
            cachedMessages.push({
                id: newMessageId,
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
            return new CreateMessageResponseDto('success', 201, 'Message created successfully', { id: newMessageId, profilePicture });
        } catch (error) {
            console.error('Error:', error);
            return new CreateMessageResponseDto('error', 400, 'The message could not be sent.', {});
        }
    }


   
    async getUserMessages(userId: string): Promise<GetMessagesByUserResponseDto> {
        try {
            console.log('User ID:', userId);

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
                return new GetMessagesByUserResponseDto('error', 404, 'User not found.', { result: [] });
            }

            const messageRef = collection(this.firebaseService.fireStore, 'messages');

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
                console.log('No received messages found.');
                return new GetMessagesByUserResponseDto('error', 404, 'Messages not found.', { result: userMessages });
            }

            console.log('User messages fetched successfully.');
            return new GetMessagesByUserResponseDto('success', 200, 'Messages retrieved succesfully.', { result: userMessages });
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages.', { result: [] });
        }
    }



    
    
    async getReceivedMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            const recipientMessagesQuery = query(
                messageRef,
                where('recipientEmail', '==', userEmail),
                where('active', '==', true)
            );
            const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

            const userMessages = [];

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
                console.log('No received messages found.');
                return new GetMessagesByUserResponseDto('error', 404, 'Messages not found.', { result: userMessages });
            }

            console.log('Received messages fetched successfully.');
            return new GetMessagesByUserResponseDto('success', 200, 'Messages retrieved successfully.', { result: userMessages });
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages.', { result: [] });
        }
    }


    
  
    async getSentMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            const senderMessagesQuery = query(
                messageRef,
                where('senderEmail', '==', userEmail),
                where('active', '==', true)
            );
            const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

            const userMessages = [];

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
                console.log('No sent messages found.');
                return new GetMessagesByUserResponseDto('error', 404, 'Messages not found.', { result: userMessages });
            }

            console.log('Sent messages fetched successfully.');
            return new GetMessagesByUserResponseDto('success', 200, 'Messages retrieved successfully.', { result: userMessages });
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return new GetMessagesByUserResponseDto('error', 400, 'Messages could not be retrieved.', { result: [] });
        }
    }




   
    async searchMessagesByKeywords(userId: string, keywords: string | string[]): Promise<GetMessagesByUserResponseDto> {
        try {
            console.log(`User ID: ${userId}`);
            console.log('Starting searchMessagesByKeywords function...');

            const usersRef = collection(this.firebaseService.fireStore, 'users');
            const userQuery = query(usersRef, where('id', '==', userId));
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                console.log('User not found.');
                return new GetMessagesByUserResponseDto('error', 404, 'USERNOTFOUND', { result: [] });
            }

            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();
            const userEmail = userData.email;

            console.log(`User email: ${userEmail}`);

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
                console.log('No matching messages found.');
                return new GetMessagesByUserResponseDto('error', 404, 'Messages not found.', { result: matchedMessages });
            }

            console.log('Matching messages fetched successfully.');
            return new GetMessagesByUserResponseDto('success', 200, 'Messages retrieved successfully.', { result: matchedMessages });
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return new GetMessagesByUserResponseDto('error', 400, 'Messages could not be retrieved.', { result: [] });
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
                return new UpdateMessageStatusResponseDto('error', 404, 'Message not found.', { result: {} });
            }

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

            return new UpdateMessageStatusResponseDto('success', 200, 'Message updated successfully.', { result: {} });
        } catch (error) {
            console.error('An error occurred:', error);
            return new UpdateMessageStatusResponseDto('error', 400, 'Message could not be updated.', { result: {} });
        }
    }
   
    async getFilteredMessages(filter: string, userId: string ): Promise<GetMessagesByUserResponseDto> {

        const usersRef = collection(this.firebaseService.fireStore, 'users');
        const userQuery = query(usersRef, where('id', '==', userId));
        const userQuerySnapshot = await getDocs(userQuery);

        if (userQuerySnapshot.empty) {
            console.log('User not found.');
            return new GetMessagesByUserResponseDto('error', 404, 'User not found.', { result: [] });

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
                        return new GetMessagesByUserResponseDto('error', 404, 'Read messages not found.', { result: [] });

                    }

                    return new GetMessagesByUserResponseDto('success', 200, 'Read messages retrieved successfully.', { result: readMessages });

                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages', { result: [] });
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
                        return new GetMessagesByUserResponseDto('error', 404, 'Unread messages not found.', { result: [] });

                    }

                    return new GetMessagesByUserResponseDto('success', 200, 'Unread messages retrieved successfully.', { result: unreadMessages });

                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages', { result: [] });
                }


            case 'archived':
                try {
                    console.log("Fetching archived messages...");
                    const archivedMessagesResponse = await this.getArchivedMessages(email);
                    const archivedMessages = archivedMessagesResponse.data.result;

                    console.log(`Archived messages found: ${archivedMessages.length}`);

                    if (archivedMessages.length === 0) {
                        console.log("No archived messages found.");
                        return new GetMessagesByUserResponseDto('error', 404, 'Archived messages not found.', { result: [] });

                    }

                    console.log("Archived messages retrieved successfully.");
                    return new GetMessagesByUserResponseDto('success', 200, 'Archived messages retrieved successfully.', { result: archivedMessages });

                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages', { result: [] });
                }


            case 'inquiry':

                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    const senderMessagesQuery = query(
                        messageRef,
                        where('senderEmail', '==', email),
                        where('active', '==', true)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('active', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userInquiryMessages = [];

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
                        return new GetMessagesByUserResponseDto('error', 404, 'Inquiry messages not found.', { result: [] });

                    }

                    return new GetMessagesByUserResponseDto('success', 200, 'Inquiry messages retrieved successfully.', { result: userInquiryMessages });

                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages', { result: [] });
                }

            case 'sent':

                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    const senderMessagesQuery = query(
                        messageRef,
                        where('senderEmail', '==', email),
                        where('active', '==', true)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    const userMessages = [];

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
                        return new GetMessagesByUserResponseDto('error', 404, 'Sent messages not found.', { result: [] });

                    }

                    return new GetMessagesByUserResponseDto('success', 200, 'Sent messages retrieved successfully.', { result: userMessages });

                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages', { result: [] });
                }


            case 'received':

                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('active', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userMessages = [];

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
                        return new GetMessagesByUserResponseDto('error', 404, 'Received messages not found.', { result: [] });

                    }

                    return new GetMessagesByUserResponseDto('success', 200, 'Received messages retrieved successfully.', { result: userMessages });

                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages', { result: [] });
                }

            case 'complaint': 

                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    const senderMessagesQuery = query(
                        messageRef,
                        where('senderEmail', '==', email),
                        where('active', '==', true)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('active', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userComplaintMessages = [];

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
                        return new GetMessagesByUserResponseDto('error', 404, 'Complaint messages not found.', { result: [] });

                    }

                    return new GetMessagesByUserResponseDto('success', 200, 'Complaint messages retrieved successfully.', { result: userComplaintMessages });

                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages', { result: [] });
                }

            case 'highlighted':
                try {
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');


                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('active', '==', true)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const highlightedMessages = []                  

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
                        return new GetMessagesByUserResponseDto('error', 404, 'Highlighted messages not found.', { result: [] });

                    }

                    return new GetMessagesByUserResponseDto('success', 200, 'Highlighted messages retrieved successfully.', { result: highlightedMessages });

                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages', { result: [] });
                }

            case 'deleted':
                try {
                    console.log('User Email:', email);
                    const messageRef = collection(this.firebaseService.fireStore, 'messages');

                    const senderMessagesQuery = query(
                        messageRef,
                        where('senderEmail', '==', email),
                        where('active', '==', false)
                    );
                    const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

                    const recipientMessagesQuery = query(
                        messageRef,
                        where('recipientEmail', '==', email),
                        where('active', '==', false)
                    );
                    const recipientMessagesQuerySnapshot = await getDocs(recipientMessagesQuery);

                    const userEliminatedMessages = [];

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
                        return new GetMessagesByUserResponseDto('error', 404, 'Eliminated messages not found.', { result: [] });

                    }

                    return new GetMessagesByUserResponseDto('success', 200, 'Eliminated messages retrieved successfully.', { result: userEliminatedMessages });

                } catch (error: unknown) {
                    console.warn(`[ERROR]: ${error}`);
                    return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages', { result: [] });
                }
        


              default:
                return new GetMessagesByUserResponseDto('error', 400, 'The filter is invalid.', { result: [] });
        }
    }



   
    async addOrRemoveTagsFromMessage(id: string, action: 'add' | 'delete', tagsIds: string[]): Promise<AddTagsResponseDto> {
        try {
            console.log(`Adding or removing tags from a message based on action: ${action}...`);


            const messagesCollectionRef = collection(this.firebaseService.fireStore, 'messages');
            const messagesQuery = query(messagesCollectionRef, where('id', '==', id));
            const messagesQuerySnapshot = await getDocs(messagesQuery);

            if (messagesQuerySnapshot.empty) {
                return new AddTagsResponseDto('error', 404, 'Message not found.', { result: {} });
            }

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
                    } else {
                        return new AddTagsResponseDto('error', 404, 'Tags not found.', { result: {} });
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
                    } else {
                        return new AddTagsResponseDto('error', 404, 'Tags not found.', { result: {} });
                    }
                }
            } else {
                return new AddTagsResponseDto('error', 400, 'Invalid action, use add or delete.', { result: {} });
            }

            await updateDoc(messageDocRef, { tags: updatedTags });

            console.log('Tags added or removed from the message.');

            return new AddTagsResponseDto('success', 200, 'Tags updated successfully.', { result: {} });
        } catch (error) {
            console.error('Error:', error);
            return new AddTagsResponseDto('error', 400, 'There was an error updating the tags.', { result: {} });
        }
    }


    async searchMessagesByTags(userId: string, tags: string[]): Promise<GetMessagesByUserResponseDto> {
        try {
            const usersRef = collection(this.firebaseService.fireStore, 'users');
            const userQuerySnapshot = await getDocs(query(usersRef, where('id', '==', userId)));

            if (userQuerySnapshot.empty) {
                return new GetMessagesByUserResponseDto('error', 404, 'User not found.', { result: {} });
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
                return new GetMessagesByUserResponseDto('error', 404, 'Messages not found.', { result: {} });
            }

            return new GetMessagesByUserResponseDto('success', 200, 'Messages retrieved successfully.', { result: matchedMessages });
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return new GetMessagesByUserResponseDto('error', 400, 'There was an error retrieving the messages', { result: [] });
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
                return new GetMessageByIdResponseDto('error', 404, 'Message not found.', { result: {} });
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
                status: 'success',
                code: 200,
                message: 'Message retrieved successfully.',
                data: {
                    result: {
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
                    },
                },
            };

            return messageDto;
        } catch (error: unknown) {
            return new GetMessageByIdResponseDto('error', 400, 'There was an error retrieving the message', { result: [] });
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