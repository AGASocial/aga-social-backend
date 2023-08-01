import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import { LogInResponseDto } from './dto/loginResponse.dto';
import { SignUpDtoResponse } from './dto/signupResponse.dto';
import { RecoverPasswordDto } from './dto/recoverPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, getAuth } from 'firebase/auth'
import { setDoc, DocumentReference, doc, addDoc, updateDoc, getDoc, collection, where, QueryFieldFilterConstraint, query, getDocs, DocumentSnapshot } from 'firebase/firestore';
import { RecoverPasswordDtoResponse } from './dto/recoverPasswordResponse.dto';
import { HashService } from 'src/utils/hash.service';
import * as firebaseAdminAuth from 'firebase-admin/auth';
import { LogOutResponseDto } from './dto/logoutResponse.dto';
import { cookieTimeMultiplier, freezeTime, jwtSecret, otpAppName, refreshSecret, refreshTime } from 'src/utils/constants';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshResponseDto } from './dto/refreshResponse.dto';
import { UsersService } from 'src/users/users.service';
import { SessionService } from 'src/session/session.service';
import { User } from 'src/users/users.entity';
import { ChangePasswordDtoResponse } from './dto/changePasswordResponse.dto';
import * as speakeasy from 'speakeasy';
import { Role } from 'src/authorization/entities/role.enum'
import { QueryDocumentSnapshot } from 'firebase/firestore';
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
                    role: Role.SUBSCRIBER,
                };
                let docReference: DocumentReference = doc(this.firebaseService.usersCollection, id);
                await setDoc(docReference, newUser);
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


}