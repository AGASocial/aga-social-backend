import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { addDoc, collection, CollectionReference, doc, DocumentReference, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { FirebaseService } from "../../firebase/firebase.service";
import { CreateEmailResponseDto } from "./dto/createEmailResponse.dto";
import { CreatePluginResponseDto } from "./dto/createPluginResponse.dto";
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from "./dto/createUser.dto";
import { CreateUserResponseDto } from "./dto/createUserResponse.dto";
import { UsersService } from "../../users/users.service";
import { HashService } from "../../utils/hash.service";
import { GetEmailsResponseDto } from "./dto/getEmailsResponse.dto";
import { GetUsersByPluginIdResponseDto } from "./dto/getUsersResponse.dto";
import * as nodemailer from 'nodemailer';
import { SendEmailResponseDto } from "./dto/sendEmailToAllResponse.dto";
import { SendMessageToAllDto } from "./dto/sendMessageToAll.dto";
import { CreateJsonResponseDto } from "./dto/createJsonResponse.dto";
import { GetJsonByIdResponseDto } from "./dto/getCompleteJsonByIdResponse.dto";
import { AddJsonSectionsResponseDto } from "./dto/addJsonSectionsResponse.dto";
import { DeleteJsonSectionsResponseDto } from "./dto/deleteJsonSectionsResponse.dto";
import { UpdateJsonResponseDto } from "./dto/updateJsonResponse.dto";



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
    async registerNewPlugin(domain: string): Promise<CreatePluginResponseDto> {
        try {
            const newPluginsCollectionRef: CollectionReference = collection(this.firebaseService.fireStore, 'newPlugins');

            const ownerId: string = uuidv4();

            const pluginData = {
                domain,
                ownerId,
            };

            const newPluginDocumentRef: DocumentReference = await addDoc(newPluginsCollectionRef, pluginData);

            const newPluginId = newPluginDocumentRef.id;

            return new CreatePluginResponseDto(201, 'PLUGINCREATEDSUCCESSFULLY', newPluginId, ownerId);
        } catch (error) {
            console.error('Error registering the new plugin:', error);
            throw new Error(`Error registering the new plugin: ${error.message}`);
        }
    }




    async registerUser(createUserDto: CreateUserDto, pluginId: string): Promise<CreateUserResponseDto> {
        try {
            const { email, username, password, name } = createUserDto;

            const emailQuery = query(
                collection(this.firebaseService.fireStore, 'newPlugins', pluginId, 'pluginUsers'),
                where('email', '==', email)
            );
            const emailQuerySnapshot = await getDocs(emailQuery);

            const usernameQuery = query(
                collection(this.firebaseService.fireStore, 'newPlugins', pluginId, 'pluginUsers'),
                where('username', '==', username)
            );
            const usernameQuerySnapshot = await getDocs(usernameQuery);

            if (!emailQuerySnapshot.empty) {
                throw new BadRequestException('Email already exists');
            }

            if (!usernameQuerySnapshot.empty) {
                throw new BadRequestException('Username already exists');
            }

            const hashedPassword = await this.hashService.hashString(password);
            createUserDto.password = hashedPassword;

            const userId = uuidv4();

            const pluginDocumentRef: DocumentReference = doc(this.firebaseService.fireStore, 'newPlugins', pluginId);
            const usersCollectionRef = collection(pluginDocumentRef, 'pluginUsers');

            await addDoc(usersCollectionRef, { email, username, hashedPassword, name, userId });

            return new CreateUserResponseDto(201, 'USERREGISTEREDSUCCESSFULLY', userId);
        } catch (error) {
            console.error('Error registering the user:', error);
            throw new BadRequestException(`Error registering the user: ${error.message}`);
        }
    }



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




    async getUsersByPluginId(pluginId: string): Promise<GetUsersByPluginIdResponseDto> {
        try {
            const pluginDocumentRef = doc(this.firebaseService.fireStore, 'newPlugins', pluginId);
            const usersCollectionRef = collection(pluginDocumentRef, 'pluginUsers');
            const querySnapshot = await getDocs(usersCollectionRef);

            const users: Record<string, any>[] = [];

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const { hashedPassword, ...userWithoutPassword } = userData;
                users.push(userWithoutPassword);
            });

            const responseDto = new GetUsersByPluginIdResponseDto(
                200,
                'USERSRETRIEVEDSUCCESSFULLY',
                users,
            );

            return responseDto;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new BadRequestException(`Error fetching users: ${error.message}`);
        }
    }



    //////////////   JSON   ///////////////////////






    //Check this
    async registerJson(pluginId: string, username: string, jsonData: any): Promise<CreateJsonResponseDto> {
        try {
            const usernameQuery = query(
                collection(this.firebaseService.fireStore, 'newPlugins', pluginId, 'pluginUsers'),
                where('username', '==', username)
            );
            const usernameQuerySnapshot = await getDocs(usernameQuery);

            if (usernameQuerySnapshot.empty) {
                throw new BadRequestException('Username does not exist');
            }

            const hasDuplicateTopLevelKeys = (obj: any) => {
                const keys = new Set<string>();
                for (const key in obj) {
                    if (keys.has(key)) {
                        return true; 
                    }
                    keys.add(key);
                }
                return false; 
            };

            if (hasDuplicateTopLevelKeys(jsonData)) {
                throw new BadRequestException('Duplicate top-level section names are not allowed');
            }

            const jsonWithUploader = { data: jsonData, uploaderUsername: username };

            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );
            const newJsonDocRef = await addDoc(userJsonsCollectionRef, jsonWithUploader);

            console.log(`JSON registered with ID: ${newJsonDocRef.id}`);

            return new CreateJsonResponseDto(201, 'JSONREGISTEREDSUCCESSFULLY', newJsonDocRef.id);
        } catch (error) {
            console.error('Error registering JSON:', error);
            throw new BadRequestException(`Error registering JSON: ${error.message}`);
        }
    }






    async getJsonById(pluginId: string, jsonId: string): Promise<GetJsonByIdResponseDto> {
        try {
            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );

            const jsonDocRef = doc(userJsonsCollectionRef, jsonId);
            const jsonDocSnapshot = await getDoc(jsonDocRef);

            if (jsonDocSnapshot.exists()) {
                const jsonData = jsonDocSnapshot.data();
                return new GetJsonByIdResponseDto(200, 'JSONRETRIEVEDSUCCESSFULLY', jsonData);
            } else {
                throw new NotFoundException('JSON not found');
            }
        } catch (error) {
            console.error('Error getting JSON:', error);
            throw new NotFoundException(`Error getting JSON: ${error.message}`);
        }
    }



    async getJsonSectionById(pluginId: string, jsonId: string, sectionName: string): Promise<GetJsonByIdResponseDto> {
        try {
            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );

            const jsonDocRef = doc(userJsonsCollectionRef, jsonId);
            const jsonDocSnapshot = await getDoc(jsonDocRef);

            if (jsonDocSnapshot.exists()) {
                const jsonData = jsonDocSnapshot.data()?.data;

                if (jsonData) {
                    const lowerSectionName = sectionName.toLowerCase();
                    const jsonDataLower = Object.keys(jsonData).reduce((acc, key) => {
                        acc[key.toLowerCase()] = jsonData[key];
                        return acc;
                    }, {});

                    if (jsonDataLower[lowerSectionName]) {
                        const sectionData = jsonDataLower[lowerSectionName];

                        const responsePayload = {
                            [lowerSectionName]: sectionData,
                        };

                        const response = new GetJsonByIdResponseDto(200, 'JSONRETRIEVEDSUCCESSFULLY', responsePayload);

                        return response;
                    }
                }
            }

            throw new NotFoundException(`Section '${sectionName}' not found in JSON`);
        } catch (error) {
            console.error(`Error getting section '${sectionName}':`, error);
            throw new NotFoundException(`Error getting section '${sectionName}': ${error.message}`);
        }
    }





    async addJsonSections(pluginId: string, jsonId: string, newSections: any): Promise<AddJsonSectionsResponseDto> {
        try {
            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );

            const jsonDocRef = doc(userJsonsCollectionRef, jsonId);
            const jsonDocSnapshot = await getDoc(jsonDocRef);

            if (jsonDocSnapshot.exists()) {
                const jsonData = jsonDocSnapshot.data()?.data;

                if (jsonData) {
                    const existingSectionNames = Object.keys(jsonData);
                    const newSectionNames = Object.keys(newSections);

                    const intersection = existingSectionNames.filter(name => newSectionNames.includes(name));

                    if (intersection.length === 0) {
                        const updatedData = { ...jsonData, ...newSections };

                        await updateDoc(jsonDocRef, { data: updatedData });

                        return new AddJsonSectionsResponseDto(201, 'SECTIONSADDEDSUCCESSFULLY');
                    } else {
                        throw new Error('One or more sections have names that already exist.');
                    }
                }
            }

            throw new NotFoundException(`JSON with ID '${jsonId}' not found.`);
        } catch (error) {
            console.error('Error adding JSON sections:', error);
            throw error;
        }
    }



    async deleteJsonSectionById(pluginId: string, jsonId: string, sectionName: string): Promise<DeleteJsonSectionsResponseDto> {
        try {
            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );

            const jsonDocRef = doc(userJsonsCollectionRef, jsonId);
            const jsonDocSnapshot = await getDoc(jsonDocRef);

            if (jsonDocSnapshot.exists()) {
                const jsonData = jsonDocSnapshot.data()?.data;

                if (jsonData && jsonData[sectionName]) {
                    delete jsonData[sectionName];

                    await updateDoc(jsonDocRef, { data: jsonData });

                    return new DeleteJsonSectionsResponseDto(200, 'SECTIONSDELETEDSUCCESSFULLY');
                } else {
                    throw new NotFoundException(`Section '${sectionName}' not found in JSON`);
                }
            }

            throw new NotFoundException(`JSON with ID '${jsonId}' not found.`);
        } catch (error) {
            console.error(`Error deleting section '${sectionName}':`, error);
            throw error;
        }
    }



    async updateJsonSection(pluginId: string, jsonId: string, sectionName: string, updatedData: any): Promise<UpdateJsonResponseDto> {
        try {
            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );

            const jsonDocRef = doc(userJsonsCollectionRef, jsonId);
            const jsonDocSnapshot = await getDoc(jsonDocRef);

            if (jsonDocSnapshot.exists()) {
                const jsonData = jsonDocSnapshot.data()?.data;

                if (jsonData) {
                    const lowerSectionName = sectionName.toLowerCase();
                    const jsonDataLower = Object.keys(jsonData).reduce((acc, key) => {
                        acc[key.toLowerCase()] = jsonData[key];
                        return acc;
                    }, {});

                    if (jsonDataLower[lowerSectionName]) {
                        jsonDataLower[lowerSectionName] = updatedData[lowerSectionName];

                        await setDoc(jsonDocRef, { data: jsonDataLower }, { merge: true });

                        const responsePayload = {
                            [lowerSectionName]: jsonDataLower[lowerSectionName],
                        };

                        const response = new UpdateJsonResponseDto(200, 'JSONUPDATEDSUCCESSFULLY', responsePayload);

                        return response;
                    }
                }
            }

            throw new NotFoundException(`Section '${sectionName}' not found in JSON`);
        } catch (error) {
            console.error(`Error updating section '${sectionName}':`, error);
            throw new NotFoundException(`Error updating section '${sectionName}': ${error.message}`);
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