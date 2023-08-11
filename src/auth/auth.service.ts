import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import { LogInResponseDto } from './dto/loginResponse.dto';
import { SignUpDtoResponse } from './dto/signupResponse.dto';
import { RecoverPasswordDto } from './dto/recoverPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, getAuth, deleteUser, updateEmail } from 'firebase/auth'
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
import { ChangeUsernameDto } from './dto/changeUsername.dto';
import { ChangeUsernameDtoResponse } from './dto/changeUsernameResponse.dto';
import { ChangeEmailDto } from './dto/changeEmail.dto';
import { ChangeEmailDtoResponse } from './dto/changeEmailResponse.dto';
import { ChangeNameDto } from './dto/changeName.dto';
import { ChangeNameDtoResponse } from './dto/changeNameResponse.dto';
import { ChangeSecurityAnswerDto } from './dto/changeSecurityAnswer.dto';
import { ChangeSecurityAnswerDtoResponse } from './dto/changeSecurityAnswerResponse.dto';
dotenv.config();
@Injectable()
export class AuthService {
    constructor(private firebaseService: FirebaseService, private jwtService: JwtService, private hashService: HashService, private usersService: UsersService, private sessionService: SessionService) { }

    async firebaseLogin(logInDto: LogInDto): Promise<LogInResponseDto> {
        console.log('firebaseLogin - Start of function');

        const user = await this.firebaseService.getUserByEmail(logInDto.email);

        if (!user) {
            console.log('firebaseLogin - User not found');
            throw new BadRequestException('WRONGCREDENTIALS');
        }

        const hashedPassword = user.password;
        const doPasswordsMatch = await this.hashService.compareHashedStrings(
            logInDto.password,
            hashedPassword,
        );
        console.log('firebaseLogin - Password match result:', doPasswordsMatch);

        if (!doPasswordsMatch) {
            console.log('firebaseLogin - Passwords do not match');
            throw new BadRequestException('WRONGCREDENTIALS');
        }

        let userCredential;
        try {
            userCredential = await signInWithEmailAndPassword(this.firebaseService.auth,
                logInDto.email,
                hashedPassword
            );
        } catch (error: unknown) {
            console.warn(`firebaseLogin - Error while signing in with email and password: ${error}`);
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

            const loginResponseDto: LogInResponseDto = {
                statusCode: 201,
                message: 'LOGINSUCCESSFUL',
                bearer_token: token,
                authCookieAge: sessionTime * cookieTimeMultiplier,
                refresh_token: refreshToken,
                refreshCookieAge: refreshTime * cookieTimeMultiplier,
            };

            return loginResponseDto;
        } else {
            console.log('firebaseLogin - User credential not found');
            throw new BadRequestException('WRONGCREDENTIALS');
        }
    }



    async firebaseRefresh(refreshDto: RefreshDto): Promise<RefreshResponseDto> {
        const userId = this.usersService.extractID(refreshDto.refresh_token);
        const userSnap = await this.usersService.getUserById(userId);
        const userEmail = this.usersService.extractEmail(refreshDto.refresh_token);
        const payload = { email: userEmail, id: userId };
        const newToken = this.jwtService.sign(payload, {
            secret: jwtSecret,
            expiresIn: await this.sessionService.getSessionTime(userSnap)
        });
        const refreshDtoResponse: RefreshResponseDto = { statusCode: 200, message: 'SESSIONREFRESHED', bearer_token: newToken };
        return refreshDtoResponse;
    }

    async firebaseSignUp(signUpDto: SignUpDto): Promise<SignUpDtoResponse> {
        const roleId = process.env.SUBSCRIBER_ID;
        const roleRef = doc(this.firebaseService.fireStore, 'roles', roleId);
        const roleSnapshot = await getDoc(roleRef);
        const roleData = roleSnapshot.data();
        const roleEntity: Role = {
            
            name: roleData.name,
            description: roleData.description,
            isDefault: roleData.isDefault,
            isActive: roleData.isActive
        };

        const { email, username, password, name, security_answer } = signUpDto;
        const hashedPassword = await this.hashService.hashString(password);
        signUpDto.password = hashedPassword;
        const hashedSecurityAnswer = await this.hashService.hashString(security_answer);
        signUpDto.security_answer = hashedSecurityAnswer;

        console.log('Before emailChecker...');
        await this.usersService.emailChecker(email, false);
        console.log('After emailChecker...');

        const usersRef = collection(this.firebaseService.fireStore, 'users');

        //query for checking if there is someone with the username in dto
        const customUserWhere: QueryFieldFilterConstraint = where('username', '==', username);
        const userQuery = query(usersRef, customUserWhere);
        const userQuerySnapshot = await getDocs(userQuery);

        if (!userQuerySnapshot.empty) {
            throw new BadRequestException('USERNAMEEXISTS');
        }

        try {
            console.log('Before createUserWithEmailAndPassword...');
            let userCredential = await createUserWithEmailAndPassword(
                this.firebaseService.auth,
                email,
                hashedPassword,
            );
            console.log('After createUserWithEmailAndPassword...');

            if (userCredential) {
                
                const id: string = userCredential.user.uid;
                let newUser: User = {
                    email: email,
                    username: username,
                    password: hashedPassword,
                    name: name,
                    security_answer: signUpDto.security_answer,
                    role: [roleEntity],
                    purchasedBooks: [],
                    purchasedCourses: []
                };
                let docReference: DocumentReference = doc(this.firebaseService.usersCollection, id);
                await setDoc(docReference, newUser);


                const cachedCourses = await this.firebaseService.getCollectionData('users');
                cachedCourses.push({
                    email,
                    username,
                    password,
                    name,
                    security_answer,
                    role: [roleEntity],
                    purchasedBooks: [],
                    purchasedCourses: [],
                });
                this.firebaseService.setCollectionData('users', cachedCourses);
                console.log('User added to the cache successfully.');


                const signUpDtoResponse: SignUpDtoResponse = {
                    statusCode: 201,
                    message: 'SIGNUPSUCCESSFUL',
                };
                return signUpDtoResponse;
            }
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }
    }


    async firebaseDeleteUser(deleteUserDto: DeleteUserDto): Promise<DeleteUserResponseDto> {
        const { email, security_answer } = deleteUserDto;

        try {
            const userQuery = query(this.firebaseService.usersCollection, where('email', '==', email), limit(1));
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                throw new NotFoundException('User not found');
            }

            const userDoc = userQuerySnapshot.docs[0];

            const userSecurityAnswer = userDoc.data().security_answer;
            const isSecurityAnswerCorrect = await this.hashService.compareHashedStrings(security_answer, userSecurityAnswer);

            if (!isSecurityAnswerCorrect) {
                throw new UnauthorizedException('Incorrect security answer');
            }

            await deleteDoc(userDoc.ref);
            console.log(`User with email ${email} has been successfully deleted.`);


            const cachedCourses = await this.firebaseService.getCollectionData('users');
            const indexToDelete = cachedCourses.findIndex((user) => user.email === email);

            if (indexToDelete !== -1) {
                cachedCourses.splice(indexToDelete, 1);
                this.firebaseService.setCollectionData('users', cachedCourses);
            }

            const deleteUserResponseDto: DeleteUserResponseDto = {
                statusCode: 200,
                message: 'USERDELETED',
            };
            return deleteUserResponseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('USERDELETEFAILED');
        }
    }






    async firebaseRecoverPassword(recoverPasswordDto: RecoverPasswordDto): Promise<RecoverPasswordDtoResponse> {
        console.log('firebaseRecoverPassword - Start of function');

        const { user, security_answer, new_password } = recoverPasswordDto;

        let userID: string;
        if (user.match('([a-z0-9._-]+)@([a-z0-9]+).([a-z]{2,10})(.[.a-z]{3,})?')) {
            console.log('firebaseRecoverPassword - Matching user as email');

            const emailQuerySnapshot = await this.usersService.emailChecker(user, true);
            const docSnapshot = emailQuerySnapshot.docs[0];
            userID = docSnapshot.id;
        } else if (user.match('^[A-Z](?=.{0}[a-z]+[-._]{1}[1-9]{1,4}$).{1,20}$')) {
            console.log('firebaseRecoverPassword - Matching user as username');

            userID = await this.usersService.searchUser(user);
        } else {
            throw new BadRequestException('INVALIDUSER');
        }

        const singleUserReference = doc(this.firebaseService.usersCollection, userID);
        const singleUserSnap = await getDoc(singleUserReference);
        const doSecurityAnswersMatch = await this.hashService.compareHashedStrings(
            security_answer,
            singleUserSnap.get("security_answer")
        );
        if (!doSecurityAnswersMatch) {
            console.log('firebaseRecoverPassword - Security answers do not match');
            throw new BadRequestException('WRONGCREDENTIALS');
        }

        const hashedPassword = singleUserSnap.get("password");
        const newHashedPassword = await this.hashService.hashString(new_password);
        const email: string = singleUserSnap.get("email");
        const userCredential = await signInWithEmailAndPassword(this.firebaseService.auth, email, hashedPassword);

        if (userCredential) {
            console.log('firebaseRecoverPassword - User credential found');

            try {
                const userUpdated = await firebaseAdminAuth.getAuth().updateUser(userID, {
                    password: newHashedPassword
                });

                if (userUpdated) {
                    await updateDoc(singleUserReference, {
                        password: newHashedPassword
                    });
                } else {
                    console.log('firebaseRecoverPassword - User not found during password update');
                    throw new BadRequestException('USERNOTFOUND');
                }

            } catch (error: unknown) {
                console.warn(`firebaseRecoverPassword - Error while updating user password: ${error}`);
            }

            try {
                await this.firebaseService.auth.signOut();
            } catch (error: unknown) {
                console.warn(`firebaseRecoverPassword - Error while signing out: ${error}`);
            }
            const recoverPasswordDtoResponse: RecoverPasswordDtoResponse = { statusCode: 201, message: 'NEWPASSWORDASSIGNED' }

            await this.firebaseService.auth.signOut();
            console.log('firebaseRecoverPassword - New Password Assigned!');

            return recoverPasswordDtoResponse;
        } else {
            console.log('firebaseRecoverPassword - User not found');
            throw new BadRequestException('USERNOTFOUND');
        }
    }

    

    async firebaseChangePassword(changePasswordDto: ChangePasswordDto, jwtToken: string) {
        const { password, new_password } = changePasswordDto;

        const userID = this.usersService.extractID(jwtToken);
        const singleUserReference = doc(this.firebaseService.usersCollection, userID);
        const singleUserSnap = await getDoc(singleUserReference);
        this.usersService.passwordCheck(password, singleUserSnap);

        const newHashedPassword = await this.hashService.hashString(new_password);

        try {
            await updateDoc(singleUserReference, {
                password: newHashedPassword
            });
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }

        try {
            firebaseAdminAuth.getAuth().updateUser(userID, {
                password: newHashedPassword
            })
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }
        console.log('Password Changed Succesfully!')
        const changePasswordDtoResponse: ChangePasswordDtoResponse = { statusCode: 200, message: 'NEWPASSWORDASSIGNED' }
        return changePasswordDtoResponse;
    }

    async firebaseLogout(): Promise<LogOutResponseDto> {
        try {
            this.firebaseService.auth.signOut;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }
        const logoutResponseDto: LogOutResponseDto = { statusCode: 200, message: 'LOGOUTSUCCESSFUL' }
        console.log('User logged out successfully!')
        return logoutResponseDto;
    }


    async getUsers(): Promise<GetUsersResponseDto> {
        try {
            console.log('Initializing getUsers...');

            // Tries to use data in cache if it exists
            const cachedUsers = await this.firebaseService.getCollectionData('users');
            if (cachedUsers.length > 0) {
                console.log('Using cached users data.');
                const getUsersDtoResponse: GetUsersResponseDto = {
                    statusCode: 200,
                    message: "USERSGOT",
                    usersFound: cachedUsers,
                };
                return getUsersDtoResponse;
            }

            // If there is no data, it uses firestore instead
            const usersRef = this.firebaseService.usersCollection;
            const usersQuery = query(usersRef, orderBy("name"));
            console.log('User query created.');

            const usersQuerySnapshot = await getDocs(usersQuery);
            console.log('Users query snapshot obtained.');

            let queryResult = [];
            usersQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    name: data.name,
                    username: data.username,
                    role: data.role,
                });
            });
            console.log('Users data collected.');

            // the data is saved in cache for future queries
            this.firebaseService.setCollectionData('users', queryResult);

            const getUsersDtoResponse: GetUsersResponseDto = {
                statusCode: 200,
                message: "USERSGOT",
                usersFound: queryResult,
            };
            console.log('Response created.');

            return getUsersDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the users.');
        }
    }



    async getSingleUser(email: string): Promise<GetUsersResponseDto> {
        try {
            console.log('Initializing getSingleUser...');

            // Tries to use data in cache if it exists
            const cachedUsers = await this.firebaseService.getCollectionData('users');
            if (cachedUsers.length > 0) {
                console.log('Using cached users data.');
                const user = cachedUsers.find(user => user.email === email);
                if (user) {
                    const filteredUser = {
                        name: user.name,
                        username: user.username,
                        role: user.role,
                        email: user.email,
                        purchasedBooks: user.purchasedBooks,
                        purchasedCourses: user.purchasedCourses,
                    };
                    const getSingleUserDtoResponse: GetUsersResponseDto = {
                        statusCode: 200,
                        message: "USERSGOT",
                        usersFound: [filteredUser],
                    };
                    return getSingleUserDtoResponse;
                }
            }

            // If there is no data in cache, query Firestore
            const usersRef = this.firebaseService.usersCollection;
            const usersQuery = query(usersRef, where("email", "==", email));
            console.log('User query created.');

            const usersQuerySnapshot = await getDocs(usersQuery);
            console.log('Users query snapshot obtained.');

            const queryResult = usersQuerySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    name: data.name,
                    username: data.username,
                    role: data.role,
                    email: data.email,
                    purchasedBooks: data.purchasedBooks,
                    purchasedCourses: data.purchasedCourses,
                };
            });
            console.log('User data collected.');

            const getSingleUserDtoResponse: GetUsersResponseDto = {
                statusCode: queryResult.length > 0 ? 200 : 404,
                message: queryResult.length > 0 ? "USERSGOT" : "USERNOTFOUND",
                usersFound: queryResult,
            };
            console.log('Response created.');

            return getSingleUserDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the user.');
        }
    }







    async changeUsername(changeUsernameDto: ChangeUsernameDto, jwtToken: string): Promise<ChangeUsernameDtoResponse> {
        try {
            const { password, username, email } = changeUsernameDto;

            console.log('Initiating changeUsername...');

            const user = await this.firebaseService.getUserByEmail(email);
            const userID = this.usersService.extractID(jwtToken);
            const singleUserReference = doc(this.firebaseService.usersCollection, userID);
            const singleUserSnap = await getDoc(singleUserReference);

            if (!user) {
                console.log('User not found.');
                throw new BadRequestException('User not found.');
            }

            console.log('User found:', user);

            const doPasswordsMatch = await this.hashService.compareHashedStrings(password, user.password);

            if (!doPasswordsMatch) {
                console.log('Incorrect credentials.');
                throw new BadRequestException('Incorrect credentials.');
            }

            console.log('Passwords match.');


            try {
                await updateDoc(singleUserReference, {
                    username: username
                });
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
            }

            

            console.log('Username updated successfully.');

            const response: ChangeUsernameDtoResponse = {
                statusCode: 200,
                message: 'NEWUSERNAMEASSIGNED',
            };

            console.log('changeUsername completed successfully.');

            return response;
        } catch (error) {
            console.error('Error: ', error);
            throw new BadRequestException('An error occurred while trying to change the username.');
        }
    }



    async changeEmail(changeEmailDto: ChangeEmailDto, jwtToken: string): Promise<ChangeEmailDtoResponse> {
        try {
            const { old_email, security_answer, new_email } = changeEmailDto;

            console.log('Initiating changeEmail...');

            const user = await this.firebaseService.getUserByEmail(old_email);
            const userID = this.usersService.extractID(jwtToken);
            const singleUserReference = doc(this.firebaseService.usersCollection, userID);
            const singleUserSnap = await getDoc(singleUserReference);

            if (!user) {
                console.log('User not found.');
                throw new BadRequestException('User not found.');
            }

            console.log('User found:', user);

            const isSecurityAnswerCorrect = await this.hashService.compareHashedStrings(security_answer, user.security_answer);

            if (!isSecurityAnswerCorrect) {
                console.log('Incorrect security answer.');
                throw new BadRequestException('Incorrect security answer.');
            }

            console.log('Security answer is correct.');

            try {
                const auth = getAuth();
                const userCredential = await updateEmail(auth.currentUser, new_email);
                console.log('Email Updated in Firebase Auth.');

            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
                throw new BadRequestException('An error occurred while updating the email.');
            }

            try {
                await updateDoc(singleUserReference, {
                    email: new_email
                });
                console.log('Email updated in Firestore:', new_email);
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
                throw new BadRequestException('An error occurred while updating the email in Firestore.');
            }

            console.log('Email updated successfully.');

            const response: ChangeEmailDtoResponse = {
                statusCode: 200,
                message: 'NEWEMAILASSIGNED',
            };

            console.log('changeEmail completed successfully.');

            return response;
        } catch (error) {
            console.error('Error: ', error);
            throw new BadRequestException('An error occurred while trying to change the email.');
        }
    }




    async changeName(changeNameDto: ChangeNameDto, jwtToken: string): Promise<ChangeNameDtoResponse> {
        try {
            const { password, name, email } = changeNameDto;

            console.log('Initiating changeName...');

            const user = await this.firebaseService.getUserByEmail(email);
            const userID = this.usersService.extractID(jwtToken); 
            const singleUserReference = doc(this.firebaseService.usersCollection, userID);
            const singleUserSnap = await getDoc(singleUserReference);

            if (!user) {
                console.log('User not found.');
                throw new BadRequestException('User not found.');
            }

            console.log('User found:', user);

            const doPasswordsMatch = await this.hashService.compareHashedStrings(password, user.password);

            if (!doPasswordsMatch) {
                console.log('Incorrect credentials.');
                throw new BadRequestException('Incorrect credentials.');
            }

            console.log('Passwords match.');

            try {
                await updateDoc(singleUserReference, {
                    name: name
                });
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
            }

            console.log('Name updated successfully.');

            const response: ChangeNameDtoResponse = {
                statusCode: 200,
                message: 'NEWNAMEASSIGNED',
            };

            console.log('changeName completed successfully.');

            return response;
        } catch (error) {
            console.error('Error: ', error);
            throw new BadRequestException('An error occurred while trying to change the name.');
        }
    }



    async changeSecurityAnswer(changeSecurityAnswerDto: ChangeSecurityAnswerDto, jwtToken: string): Promise<ChangeSecurityAnswerDtoResponse> {
        const { email, password, new_security_answer } = changeSecurityAnswerDto;

        const userID = this.usersService.extractID(jwtToken);
        const singleUserReference = doc(this.firebaseService.usersCollection, userID);
        const singleUserSnap = await getDoc(singleUserReference);

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
        }

        console.log('Security Answer Changed Successfully!');

        const changeSecurityAnswerDtoResponse: ChangeSecurityAnswerDtoResponse = {
            statusCode: 200,
            message: 'NEWSECURITYANSWERASSIGNED'
        };

        return changeSecurityAnswerDtoResponse;
    }









}