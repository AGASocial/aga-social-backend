import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import { LogInResponseDto } from './dto/loginResponse.dto';
import { SignUpDtoResponse } from './dto/signupResponse.dto';
import { RecoverPasswordDto } from './dto/recoverPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, getAuth, deleteUser, updateEmail, sendPasswordResetEmail } from 'firebase/auth'
import { setDoc, DocumentReference, doc, addDoc, updateDoc, getDoc, collection, where, QueryFieldFilterConstraint, query, getDocs, DocumentSnapshot, limit, deleteDoc, orderBy } from 'firebase/firestore';
import { RecoverPasswordDtoResponse } from './dto/recoverPasswordResponse.dto';
import * as firebaseAdminAuth from 'firebase-admin/auth';
import { LogOutResponseDto } from './dto/logoutResponse.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshResponseDto } from './dto/refreshResponse.dto';
import { ChangePasswordDtoResponse } from './dto/changePasswordResponse.dto';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { DeleteUserDto } from './dto/deleteUser.dto';
import { DeleteUserResponseDto } from './dto/deleteUserResponse.dto';
import { GetUsersResponseDto } from './dto/getUsersResponse.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { HashService } from '../utils/hash.service';
import { Role } from '../roles/entities/role.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import { SessionService } from '../session/session.service';
import { cookieTimeMultiplier, jwtSecret, refreshSecret } from '../utils/constants';
import { ChangeSecurityAnswerDto } from './dto/changeSecurityAnswer.dto';
import { ChangeSecurityAnswerDtoResponse } from './dto/changeSecurityAnswerResponse.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UpdateUserResponseDto } from './dto/updateUserResponse.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import * as admin from 'firebase-admin';
import { GetUsersEarningsResponseDto } from './dto/getUsersEarningsResponse.dto';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';
import { auth } from 'firebase-admin';




dotenv.config();
@Injectable()
export class AuthService {
    constructor(private firebaseService: FirebaseService, private jwtService: JwtService, private hashService: HashService, private usersService: UsersService, private sessionService: SessionService) { }





    
    async firebaseLogin(logInDto: LogInDto): Promise<LogInResponseDto> {
        console.log('firebaseLogin - Start');

        const user = await this.firebaseService.getUserByEmail(logInDto.email);
        if (!user) {
            const response: LogInResponseDto = {
                status: 'error',
                code: 400,
                message: 'The credentials are invalid.',
                data: {
                    result: {}
                }
            };
            return response;
        }

        console.log('User: ',user)

        let userCredential;
        try {
            userCredential = await signInWithEmailAndPassword(this.firebaseService.auth,
                logInDto.email,
                logInDto.password)
        } catch (error: unknown) {
            console.warn(`firebaseLogin - Error while signing in with email and password: ${error}`);
            const response: LogInResponseDto = {
                status: 'error',
                code: 400,
                message: 'There was an error processing the request. The credentials are invalid',
                data: {
                    result: {}
                }
            };
            return response;
        }

        if (userCredential) {
            console.log('firebaseLogin - User credential found');
            const idCredential: string = userCredential.user.uid;
            const emailCredential: string = userCredential.user.email;

            const payload = { email: emailCredential, id: idCredential };
            let sessionTime = await this.sessionService.getSessionTime(user);
            console.log('firebaseLogin - Session time:', sessionTime);

            const token = this.jwtService.sign(payload, {
                secret: jwtSecret,
                expiresIn: sessionTime,
            });
            console.log('firebaseLogin - JWT token generated');

            let refreshTime = await this.sessionService.getRefreshTime(user);
            console.log('firebaseLogin - Refresh time:', refreshTime);

            const refreshToken = this.jwtService.sign(payload, {
                secret: refreshSecret,
                expiresIn: refreshTime,
            });
            console.log('firebaseLogin - Refresh token generated');
            console.log(user.id)







            const response: LogInResponseDto = {
                status: 'success',
                code: 201,
                message: 'Request successfully processed.',
                bearer_token: token,
                authCookieAge: sessionTime * cookieTimeMultiplier,
                refresh_token: refreshToken,
                refreshCookieAge: refreshTime * cookieTimeMultiplier,
                userId: user.id,
                data: {
                    result: {
                        userId: user.id,
                    },
                },
            };


            console.log(`The user id is: ${user.id}`);
            return response;
        } else {
            console.log('firebaseLogin - User credential not found');
            const response: LogInResponseDto = {
                status: 'error',
                code: 400,
                message: 'There was an error processing the request.',
                data: {
                    result: {}
                }
            };
            return response;
        }
    }


    //
    async firebaseRefresh(refreshDto: RefreshDto): Promise<RefreshResponseDto> {
        try {
            const userId = this.usersService.extractID(refreshDto.refresh_token);
            const userSnap = await this.usersService.getUserById(userId);
            const userEmail = this.usersService.extractEmail(refreshDto.refresh_token);
            const payload = { email: userEmail, id: userId };
            const expiresIn = await this.sessionService.getSessionTime(userSnap);

            if (expiresIn <= 0) {
                const errorResponse: RefreshResponseDto = {
                    status: 'error',
                    code: 400,
                    message: 'There are no sessions in course or the cookies were recently refreshed',
                    data: {
                        result: {}
                    }
                };
                return errorResponse;
            }

            const newToken = this.jwtService.sign(payload, {
                secret: jwtSecret,
                expiresIn: expiresIn
            });

            const response: RefreshResponseDto = {
                status: 'success',
                code: 200,
                message: 'Request successfully processed.',
                bearer_token: newToken,
                data: {
                    result: {}
                }
            };
            return response;
        } catch (error) {
            console.error('An error occurred:', error);

            const errorResponse: RefreshResponseDto = {
                status: 'error',
                code: 400,
                message: 'There are no sessions in course or the cookies were recently refreshed',
                data: {
                    result: {}
                }
            };
            return errorResponse;
        }
    }



    @ApiCreatedResponse({ description: 'User registration successful', type: SignUpDtoResponse })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or username/email already exists' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async firebaseSignUp(signUpDto: SignUpDto): Promise<SignUpDtoResponse> {
        const roleId = process.env.SUBSCRIBER_ID;
        const roleRef = doc(this.firebaseService.fireStore, 'roles', roleId);
        const roleSnapshot = await getDoc(roleRef);
        const roleData = roleSnapshot.data();
        const roleEntity: Role = {
            name: roleData.name,
            description: roleData.description,
            default: roleData.default,
            active: roleData.active
        };

        const { email, username, password } = signUpDto;
        const hashedPassword = await this.hashService.hashString(password);
        signUpDto.password = hashedPassword;

        console.log('Before emailChecker...');
        const emailExists = await this.usersService.emailChecker(email, false);

        console.log('After emailChecker...');


      

        const usersRef = collection(this.firebaseService.fireStore, 'users');

        const customUserWhere: QueryFieldFilterConstraint = where('username', '==', username);
        const userQuery = query(usersRef, customUserWhere);
        const userQuerySnapshot = await getDocs(userQuery);

        if (!userQuerySnapshot.empty) {
            throw new BadRequestException('Username already exists'); 
        }

        try {
            console.log('Before createUserWithEmailAndPassword...');
            let userCredential = await createUserWithEmailAndPassword(
                this.firebaseService.auth,
                email,
                password,
            );
            console.log('After createUserWithEmailAndPassword...');
            const id: string = userCredential.user.uid;

            if (userCredential) {
                let newUser: User = {
                    id,
                    email: email,
                    username: username,
                    password: hashedPassword,
                    name: '',
                    security_answer: '',
                    role: [roleEntity],
                    purchasedBooks: [],
                    purchasedCourses: [],
                    courseEarnings: 0,
                    ebookEarnings: 0,
                    description: '',
                    country: '',
                    phoneNumber: '',
                    active: true,
                    profilePicture: ''
                };

                let docReference: DocumentReference = doc(this.firebaseService.usersCollection, id);
                await setDoc(docReference, newUser);

                const cachedUsers = await this.firebaseService.getCollectionData('users');
                cachedUsers.push(newUser);
                this.firebaseService.setCollectionData('users', cachedUsers);
                console.log('User added to the cache successfully.');

                const response: SignUpDtoResponse = {
                    status: 'success',
                    code: 201,
                    message: 'Request successfully processed.',
                    data: {
                        result: { userId: id }
                    }
                };
                return response;
            }
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            const response: SignUpDtoResponse = {
                status: 'error',
                code: 400,
                message: 'There was an error processing the request.',
                data: {
                    result: {}
                }
            };
            return response;
        }
    }



    //
    async firebaseForgotPassword(email: string): Promise<UpdateUserResponseDto> {
        try {
            const user = await this.firebaseService.getUserByEmail(email);

            if (!user) {
                const response: UpdateUserResponseDto = {
                    status: 'error',
                    code: 400,
                    message: 'There was an error processing the request, please write the email again.',
                    data: {
                        result: {}
                    }
                };
                return response;
            }

            await sendPasswordResetEmail(this.firebaseService.auth, email);

            const response: UpdateUserResponseDto = {
                status: 'success',
                code: 200,
                message: 'Password reset email sent successfully.',
                data: {
                    result: {}
                }
            };
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            const response: UpdateUserResponseDto = {
                status: 'error',
                code: 400,
                message: 'There was an error processing the request.',
                data: {
                    result: {}
                }
            };
            return response;
        }
    }



    //
    @ApiOkResponse({ description: 'Password successfully changed', type: ChangePasswordDtoResponse })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid password or password change failed' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async firebaseChangePassword(changePasswordDto: ChangePasswordDto, jwtToken: string) {
        const { password, new_password } = changePasswordDto;

        if (new_password.length < 8 || new_password.length > 30) {
            const response: ChangePasswordDtoResponse = {
                status: 'error',
                code: 400,
                message: 'Password length must be between 8 and 30 characters',
                data: {
                    result: {}
                }
            };
            return response;
        }

        const userID = this.usersService.extractID(jwtToken);
        const singleUserReference = doc(this.firebaseService.usersCollection, userID);

        const newHashedPassword = await this.hashService.hashString(new_password);

        try {
            await updateDoc(singleUserReference, {
                password: newHashedPassword
            });

            await auth().updateUser(userID, {
                password: new_password,
            });
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }

        try {
            firebaseAdminAuth.getAuth().updateUser(userID, {
                password: new_password
            })
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }
        console.log('Password Changed Succesfully!')
        const response: ChangePasswordDtoResponse = {
            status: 'success',
            code: 200,
            message: 'Request successfully processed.',
            data: {
                result: {}
            }
        };
        return response;
    }

    //
    async firebaseLogout(): Promise<LogOutResponseDto> {
        try {
            this.firebaseService.auth.signOut;
        } catch (error: unknown) {
            const response: LogOutResponseDto = {
                status: 'error',
                code: 400,
                message: 'There was an error processing the request.',
                data: {
                    result: {}
                }
            };
            return response;
        }
        const response: LogOutResponseDto = {
            status: 'success',
            code: 200,
            message: 'Request successfully processed.',
            data: {
                result: {}
            }
        };
        return response;
    }



    async getUsers(): Promise<GetUsersResponseDto> {
        try {
            console.log('Initializing getUsers...');

            const cachedUsers = await this.firebaseService.getCollectionData('users');
            if (cachedUsers.length > 0) {
                console.log('Using cached users data.');
                const sanitizedCachedUsers = cachedUsers.map((user) => ({
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    purchasedBooks: user.purchasedBooks,
                    purchasedCourses: user.purchasedCourses,
                    courseEarnings: user.courseEarnings,
                    ebookEarnings: user.ebookEarnings,
                    description: user.description,
                    country: user.country,
                    phoneNumber: user.phoneNumber,
                    active: user.active,
                    profilePicture: user.profilePicture,
                }));

                const getUsersDtoResponse: GetUsersResponseDto = new GetUsersResponseDto('success', 200, 'Users retrieved successfully', { usersFound: sanitizedCachedUsers });
                return getUsersDtoResponse;
            }

            const usersRef = this.firebaseService.usersCollection;
            const usersQuery = query(usersRef, orderBy("name"));
            console.log('User query created.');

            const usersQuerySnapshot = await getDocs(usersQuery);
            console.log('Users query snapshot obtained.');

            let queryResult = [];
            usersQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    id: data.id,
                    name: data.name,
                    username: data.username,
                    role: data.role,
                    purchasedBooks: data.purchasedBooks,
                    purchasedCourses: data.purchasedCourses,
                    courseEarnings: data.courseEarnings,
                    ebookEarnings: data.ebookEarnings,
                    description: data.description,
                    country: data.country,
                    phoneNumber: data.phoneNumber,
                    active: data.active,
                    profilePicture: data.profilePicture,
                });
            });
            console.log('Users data collected.');

            this.firebaseService.setCollectionData('users', queryResult);

            const getUsersDtoResponse: GetUsersResponseDto = new GetUsersResponseDto('success', 200, 'Users retrieved successfully', { usersFound: queryResult });
            console.log('Response created.');

            return getUsersDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            const getUsersDtoResponse: GetUsersResponseDto = new GetUsersResponseDto('error', 400, 'An error occurred, bad request.', { });
            return getUsersDtoResponse;
        }
    }




   
    async getSingleUser(id: string): Promise<GetUsersResponseDto> {
        try {
            console.log('Initializing getSingleUser...');

            const usersRef = this.firebaseService.usersCollection;
            const usersQuery = query(usersRef, where("id", "==", id));
            console.log('User query created.');

            const usersQuerySnapshot = await getDocs(usersQuery);
            console.log('Users query snapshot obtained.');

            const queryResult = usersQuerySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: data.id,
                    name: data.name,
                    username: data.username,
                    role: data.role,
                    email: data.email,
                    purchasedBooks: data.purchasedBooks,
                    purchasedCourses: data.purchasedCourses,
                    courseEarnings: data.courseEarnings,
                    ebookEarnings: data.ebookEarnings,
                    description: data.description,
                    country: data.country,
                    phoneNumber: data.phoneNumber,
                    profilePicture: data.profilePicture,
                    active: data.active
                };
            });
            console.log('User data collected.');

            const getSingleUserDtoResponse: GetUsersResponseDto = new GetUsersResponseDto(
                queryResult.length > 0 ? 'success' : 'error',
                queryResult.length > 0 ? 200 : 404,
                queryResult.length > 0 ? 'User data retrieved successfully' : 'User not found, bad request.',
                { usersFound: queryResult }
            );
            console.log('Response created.');

            return getSingleUserDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            const getUsersDtoResponse: GetUsersResponseDto = new GetUsersResponseDto('error', 400, 'An error occurred, bad request.', {});
            return getUsersDtoResponse;        }
    }














   




    @ApiOkResponse({ description: 'Security answer changed successfully', type: ChangeSecurityAnswerDtoResponse })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or incorrect credentials' })
    async changeSecurityAnswer(changeSecurityAnswerDto: ChangeSecurityAnswerDto, jwtToken: string): Promise<ChangeSecurityAnswerDtoResponse> {
        const { password, new_security_answer } = changeSecurityAnswerDto;

        const userID = this.usersService.extractID(jwtToken);
        const singleUserReference = doc(this.firebaseService.usersCollection, userID);
        const singleUserSnap = await getDoc(singleUserReference);

        if (!singleUserSnap.exists()) {
            console.log('User not found.');
            throw new BadRequestException('User not found.');
        }

        const doPasswordsMatch = await this.hashService.compareHashedStrings(password, singleUserSnap.data().password);

        if (!doPasswordsMatch) {
            console.log('Incorrect credentials.');
            throw new BadRequestException('Incorrect credentials.');
        }

        const newHashedSecurityAnswer = await this.hashService.hashString(new_security_answer);

        try {
            await updateDoc(singleUserReference, {
                security_answer: newHashedSecurityAnswer
            });
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('UPDATEERROR');
        }

        console.log('Security Answer Changed Successfully!');

        const changeSecurityAnswerDtoResponse: ChangeSecurityAnswerDtoResponse = {
            statusCode: 200,
            message: 'NEWSECURITYANSWERASSIGNED'
        };

        return changeSecurityAnswerDtoResponse;
    }











    //
    async updateUser(userId: string, newData: Partial<UpdateUserDto>): Promise<UpdateUserResponseDto> {
        try {
            const userDocumentRef: DocumentReference = doc(this.firebaseService.fireStore, 'users', userId);
            const userDocSnapshot = await getDoc(userDocumentRef);

            if (!userDocSnapshot.exists()) {
                const response: UpdateUserResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'The user does not exist',
                    data: {
                        result: {}
                    }
                };
                return response;
            }

            const validationErrors = await validate(newData, { skipMissingProperties: true });

            const usersCollectionRef = admin.firestore().collection('users');
            const querySnapshot = await usersCollectionRef.where('id', '==', userId).get();

            if (querySnapshot.empty) {
                const notFoundResponse: UpdateUserResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Invalid credentials.',
                    data: {
                        result: {}
                    }
                };
                return notFoundResponse;
            }

            const usersRef = collection(this.firebaseService.fireStore, 'users');

            if (newData.username) {
                const customUserWhere: QueryFieldFilterConstraint = where('username', '==', newData.username);
                const userQuery = query(usersRef, customUserWhere);
                const userQuerySnapshot = await getDocs(userQuery);

                if (!userQuerySnapshot.empty) {
                    const response: UpdateUserResponseDto = {
                        status: 'error',
                        code: 400,
                        message: 'Username already exists. Try a different one.',
                        data: {
                            result: {}
                        }
                    };
                    return response;
                }
            }

            if (newData.email) {
                try {
                    const auth = getAuth();
                    await updateEmail(auth.currentUser, newData.email);
                } catch (error) {
                    const emailUpdateError: UpdateUserResponseDto = {
                        status: 'error',
                        code: 400,
                        message: 'Email could not be updated, please try again',
                        data: {
                            result: {}
                        }
                    };
                    return emailUpdateError;
                }

                try {
                    const singleUserReference = doc(this.firebaseService.usersCollection, userId);
                    await updateDoc(singleUserReference, {
                        email: newData.email
                    });
                } catch (error) {
                    const firestoreEmailUpdateError: UpdateUserResponseDto = {
                        status: 'error',
                        code: 400,
                        message: 'Email could not be updated, please try again',
                        data: {
                            result: {}
                        }
                    };
                    return firestoreEmailUpdateError;
                }
            }

            const userUpdateRef = query(usersRef, where('id', '==', userId));
            const userUpdateSnapshot = await getDocs(userUpdateRef);

            if (!userUpdateSnapshot.empty) {
                const userDocRef = userUpdateSnapshot.docs[0].ref;
                console.log(newData)
                await updateDoc(userDocRef, newData);
            }

            const cachedUsers = await this.firebaseService.getCollectionData('users');
            const cachedUserIndex = cachedUsers.findIndex(user => user.id === userId);

            if (cachedUserIndex !== -1) {
                const updatedCachedUser = { id: userId, ...newData };
                cachedUsers[cachedUserIndex] = updatedCachedUser;
                await this.firebaseService.setCollectionData('users', cachedUsers);
            }

            const response: UpdateUserResponseDto = {
                status: 'success',
                code: 200,
                message: 'The user was updated correctly.',
                data: {
                    result: {}
                }
            };

            return response;
        } catch (error) {
            console.error('There was an error updating the user data:', error);
            throw error;
        }
    }


    


    async getUsersEarnings(id: string): Promise<GetUsersEarningsResponseDto> {
        try {
            const usersRef = collection(this.firebaseService.fireStore, 'users');
            const customUserWhere = where('id', '==', id);
            const userQuery = query(usersRef, customUserWhere);

            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                return new GetUsersEarningsResponseDto('error', 404, 'Bad request. User not found.', {});
            }

            const userDoc = userQuerySnapshot.docs[0];
            const user = userDoc.data();
            const ebookEarnings = user?.ebookEarnings || 0;
            const courseEarnings = user?.courseEarnings || 0;
            const totalEarnings = ebookEarnings + courseEarnings;

            const earningsInfo = {
                ebookEarnings: ebookEarnings,
                courseEarnings: courseEarnings,
                totalEarnings: totalEarnings
            };

            return new GetUsersEarningsResponseDto('success', 200, 'Earnings retrieved successfully', { earningsInfo });
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving user earnings.');
        }
    }




    async uploadProfilePicture(id: string, file: any): Promise<UpdateUserResponseDto> {
        console.log('Initializing Upload of Profile Picture...');
        try {
            const maxFileSize = 10 * 1024 * 1024; // 10 MB

            const usersCollectionRef = admin.firestore().collection('users');
            const userDoc = await usersCollectionRef.doc(id).get();

            if (!userDoc.exists) {
                return new UpdateUserResponseDto('error', 400, 'User was not found', {});
            }

            if (file.size > maxFileSize) {
                return new UpdateUserResponseDto('error', 400, 'Bad request. File exceeds the maximun size of 10MB', {});
            }

            const newProfilePictureId: string = uuidv4();
            const mediaFileName = `${Date.now()}_${file.originalname}`;
            const mediaPath = `assets/${newProfilePictureId}/${mediaFileName}`;

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
                        console.error('Error while uploading the file:', error);
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

            await usersCollectionRef.doc(id).update({ profilePicture: url });

            // Update cache
            const cachedUsers = await this.firebaseService.getCollectionData('users');
            const cachedUserIndex = cachedUsers.findIndex(user => user.id === id);
            if (cachedUserIndex !== -1) {
                cachedUsers[cachedUserIndex].profilePicture = url;
                await this.firebaseService.setCollectionData('users', cachedUsers);
            }

            return new UpdateUserResponseDto('success', 200, 'Picture updated successfully', { profilePicture: url });
        } catch (error) {
            console.error('There was an error uploading the picture:', error);
            return new UpdateUserResponseDto('error', 400, 'Bad request. Please, try again', {});

        }
    }




}