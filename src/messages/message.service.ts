import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc, where, writeBatch } from "firebase/firestore";
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


@Injectable()
export class MessageService {

    constructor(private firebaseService: FirebaseService) { }



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

            const newMessage = {
                senderEmail,
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
            };

            console.log('Creating new message...');
            const newMessageDocRef = await addDoc(messageRef, newMessage);
            const newMessageId = newMessageDocRef.id;

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
    }



    async deactivateMessage(deleteMessageDto: DeleteMessageDto): Promise<DeleteMessageResponseDto> {
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

            await updateDoc(messageDoc.ref, {
                isActive: false
            });

            const cachedMessages = await this.firebaseService.getCollectionData('messages');
            const indexToUpdate = cachedMessages.findIndex((message) =>
                message.senderEmail === senderEmail &&
                message.recipientEmail === recipientEmail &&
                message.subject === subject
            );

            if (indexToUpdate !== -1) {
                cachedMessages[indexToUpdate].isActive = false; // Update isActive attribute
                this.firebaseService.setCollectionData('messages', cachedMessages);
            }

            const response: DeleteMessageResponseDto = {
                statusCode: 200,
                message: 'MESSAGEDEACTIVATEDSUCCESSFULLY',
            };

            console.log(`The message has been deactivated successfully.`);
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }









  




    async getUserMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
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




    async markMessageAsRead(markMessageAsReadDto: MarkAsReadDto): Promise<MarkAsReadResponseDto> {
        try {
            const { recipientEmail, senderEmail, subject } = markMessageAsReadDto;
            const messageRef = collection(this.firebaseService.fireStore, 'messages');
            const messagesQuery = query(
                messageRef,
                where('recipientEmail', '==', recipientEmail),
                where('senderEmail', '==', senderEmail),
                where('subject', '==', subject),
            );

            const messagesQuerySnapshot = await getDocs(messagesQuery);
            const messagesToUpdate = [];

            messagesQuerySnapshot.forEach((doc) => {
                const message = doc.data();
                if (!message.isRead) {
                    messagesToUpdate.push({
                        id: doc.id,
                        data: {
                            isRead: true,
                            readDate: new Date(),

                        },
                    });
                }
            });

            if (messagesToUpdate.length > 0) {
                const batch = writeBatch(this.firebaseService.fireStore);
                messagesToUpdate.forEach((message) => {
                    const messageRef = doc(this.firebaseService.fireStore, 'messages', message.id);
                    batch.update(messageRef, message.data);
                });

                await batch.commit();
                console.log('Message marked as read successfully.');

                // Actualizar el caché
                const cachedMessages = await this.firebaseService.getCollectionData('messages');
                cachedMessages.forEach((cachedMessage) => {
                    if (
                        cachedMessage.recipientEmail === recipientEmail &&
                        cachedMessage.senderEmail === senderEmail &&
                        cachedMessage.subject === subject
                    ) {
                        cachedMessage.isRead = true;
                        cachedMessage.readDate = new Date();
                    }
                });
                this.firebaseService.setCollectionData('messages', cachedMessages);
                console.log('Cache updated.');

                const responseDto = new MarkAsReadResponseDto();
                responseDto.statusCode = 201;
                responseDto.message = 'MESSAGEREADSUCCESSFULLY';
                return responseDto;
            } else {
                const responseDto = new MarkAsReadResponseDto();
                responseDto.statusCode = 404;
                responseDto.message = 'MESSAGENOTFOUND';
                return responseDto;
            }
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }



    async getInquiryMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            // Query for senderEmail and isActive
            const senderMessagesQuery = query(
                messageRef,
                where('senderEmail', '==', userEmail),
                where('isActive', '==', true)
            );
            const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

            // Query for recipientEmail and isActive
            const recipientMessagesQuery = query(
                messageRef,
                where('recipientEmail', '==', userEmail),
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
    }




    async getComplaintMessages(userEmail: string): Promise<GetMessagesByUserResponseDto> {
        try {
            const messageRef = collection(this.firebaseService.fireStore, 'messages');

            // Query for senderEmail and isActive
            const senderMessagesQuery = query(
                messageRef,
                where('senderEmail', '==', userEmail),
                where('isActive', '==', true)
            );
            const senderMessagesQuerySnapshot = await getDocs(senderMessagesQuery);

            // Query for recipientEmail and isActive
            const recipientMessagesQuery = query(
                messageRef,
                where('recipientEmail', '==', userEmail),
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
    }



    async searchMessagesByKeywords(userEmail: string, keywords: string[]): Promise<GetMessagesByUserResponseDto> {
        try {
            console.log('Starting searchMessagesByKeywords function...');

            const messageRef = collection(this.firebaseService.fireStore, 'messages');
            const messagesSnapshot = await getDocs(messageRef);

            const matchedMessages = [];

            messagesSnapshot.forEach((doc) => {
                const message = doc.data();
                const messageContent = message.content.toLowerCase();
                const messageSubject = message.subject.toLowerCase();

                console.log(`Processing message:`);

                const matchedKeywords = keywords.filter(keyword => {
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





    async archiveMessage(archiveMessageDto: MarkAsArchivedDto): Promise<MarkAsArchivedResponseDto> {
        try {
            const { senderEmail, recipientEmail, subject } = archiveMessageDto;

            const messageRef = collection(this.firebaseService.fireStore, 'messages');
            const messageQuery = query(
                messageRef,
                where('senderEmail', '==', senderEmail),
                where('recipientEmail', '==', recipientEmail),
                where('subject', '==', subject)
            );

            const messageQuerySnapshot = await getDocs(messageQuery);

            if (messageQuerySnapshot.empty) {
                const responseDto = new MarkAsArchivedResponseDto();
                responseDto.statusCode = 404;
                responseDto.message = 'MESSAGENOTFOUND';
                return responseDto;
            }

            const messageDoc = messageQuerySnapshot.docs[0];
            const messageData = messageDoc.data();

            if (!messageData.isArchived) {
                const batch = writeBatch(this.firebaseService.fireStore);
                const messageRefToUpdate = doc(this.firebaseService.fireStore, 'messages', messageDoc.id);
                batch.update(messageRefToUpdate, { isArchived: true });
                await batch.commit();

                console.log('Message archived successfully.');

                const responseDto = new MarkAsArchivedResponseDto();
                responseDto.statusCode = 201;
                responseDto.message = 'MESSAGEARCHIVEDSUCCESSFULLY';
                return responseDto;
            }

            const responseDto = new MarkAsArchivedResponseDto();
            responseDto.statusCode = 200;
            responseDto.message = 'MESSAGEALREADYARCHIVED';
            return responseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }



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










    transformTimestamp(timestamp: any): string {
        if (timestamp && timestamp.seconds && timestamp.nanoseconds) {
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