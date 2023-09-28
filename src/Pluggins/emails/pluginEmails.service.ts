import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { addDoc, collection, CollectionReference, doc, DocumentData, DocumentReference, getDoc, getDocs, query, QuerySnapshot, setDoc, updateDoc, where } from "firebase/firestore";
import { FirebaseService } from "../../firebase/firebase.service";
import { CreateEmailResponseDto } from "./dto/createEmailResponse.dto";
import { CreatePluginResponseDto } from "./dto/createPluginResponse.dto";
import { v4 as uuidv4 } from 'uuid';
import { HashService } from "../../utils/hash.service";
import { GetEmailsResponseDto } from "./dto/getEmailsResponse.dto";
import * as nodemailer from 'nodemailer';
import { SendEmailResponseDto } from "./dto/sendEmailToAllResponse.dto";
import { SendMessageToAllDto } from "./dto/sendMessageToAll.dto";



@Injectable()
export class EmailsService {
    constructor(private firebaseService: FirebaseService, private hashService: HashService) { }


    @ApiOperation({ summary: 'Register an email in Firestore subcollection' })
    @ApiBadRequestResponse({ description: 'Invalid parameter/s' })
    async registerEmail(email: string, pluginId: string): Promise<CreateEmailResponseDto> {
        try {
            const pluginDocumentRef: DocumentReference = doc(this.firebaseService.fireStore, 'newPlugins', pluginId);
            const emailsCollectionRef = collection(pluginDocumentRef, 'emails');
            await addDoc(emailsCollectionRef, { email });
            return new CreateEmailResponseDto(201, 'EMAILREGISTEREDSUCCESSFULLY');
        } catch (error) {
            console.error('Error registering the email:', error);
            throw new Error(`Error registering the email: ${error.message}`);
        }
    }



    @ApiOperation({ summary: 'Register a new plugin in Firestore' })
    @ApiResponse({
        status: 201,
        description: 'The plugin was created successfully',
        type: CreatePluginResponseDto,
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error',
    })
    async registerNewPlugin(domain: string, userId: string): Promise<CreatePluginResponseDto> {
        try {
            const newPluginsCollectionRef: CollectionReference = collection(this.firebaseService.fireStore, 'newPlugins');
            const usersCollectionRef: CollectionReference = collection(this.firebaseService.fireStore, 'users');
            const userQuerySnapshot: QuerySnapshot<DocumentData> = await getDocs(usersCollectionRef);
            const userDoc = userQuerySnapshot.docs.find((doc) => doc.data().id === userId);

            if (!userDoc) {
                throw new BadRequestException(`User with userId ${userId} does not exist.`);
            }
           

            const pluginData = {
                domain,
                userId,
            };

            const newPluginDocumentRef: DocumentReference = await addDoc(newPluginsCollectionRef, pluginData);

            const newPluginId = newPluginDocumentRef.id;

            return new CreatePluginResponseDto(201, 'PLUGINCREATEDSUCCESSFULLY', newPluginId, userId);
        } catch (error) {
            console.error('Error registering the new plugin:', error);
            return new CreatePluginResponseDto(400, error.message, undefined, undefined);        }
    }









    @ApiOperation({ summary: 'Retrieve emails by plugin ID' })
    @ApiOkResponse({
        description: 'Emails retrieved successfully.',
        type: GetEmailsResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Plugin not found or no emails available.' })
    async getEmailsByPluginId(pluginId: string): Promise<GetEmailsResponseDto> {
        try {
            const pluginDocumentRef = doc(this.firebaseService.fireStore, 'newPlugins', pluginId);
            const emailsCollectionRef = collection(pluginDocumentRef, 'emails');
            const querySnapshot = await getDocs(emailsCollectionRef);

            const emails: string[] = [];

            querySnapshot.forEach((doc) => {
                const emailData = doc.data();
                const email = emailData.email;

                if (email) {
                    emails.push(email);
                }
            });

            const responseDto = new GetEmailsResponseDto(200, 'EMAILSRETRIEVEDSUCCESSFULLY', emails);

            return responseDto;
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw new Error(`Error fetching emails: ${error.message}`);
        }
    }





    /////////////////




    /*
    async sendEmailsByPluginId(pluginId: string, sendMessageToAllDto: SendMessageToAllDto, tokens: Auth.Credentials): Promise<SendEmailResponseDto> {
        try {
            const emailsResponse = await this.getEmailsByPluginId(pluginId);
            const emailsList = emailsResponse.emailList;


            const oAuth2Client = this.gmailService.createOAuth2Client();
            oAuth2Client.setCredentials(tokens);



            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: sendMessageToAllDto.senderEmail,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: tokens.refresh_token,
                    accessToken: tokens.access_token,
                },
            });



            const failedEmails: string[] = [];

            for (const email of emailsList) {
                const mailOptions = {
                    from: sendMessageToAllDto.senderEmail,
                    subject: sendMessageToAllDto.subject,
                    text: sendMessageToAllDto.content,
                    to: email,
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`Email sent to: ${email}`);
                } catch (error) {
                    console.error(`Error sending email to: ${email}`, error);
                    failedEmails.push(email);
                }
            }

            console.log('Emails sent.');

            if (failedEmails.length > 0) {
                console.log(`The following emails couldn't receive the message: ${failedEmails.join(', ')}`);
            }

            const responseDto = new SendEmailResponseDto(201, 'EMAILSENTSUCCESSFULLY');
            responseDto.failedEmails = failedEmails;
            return responseDto;
        } catch (error) {
            console.error('Error sending emails:', error);
            throw new Error(`Error sending emails: ${error.message}`);
        }
    }
    */





}