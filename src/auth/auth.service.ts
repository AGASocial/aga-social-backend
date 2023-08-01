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
import { RecoverOtpDto } from './dto/recoverOtp.dto';
import { RecoverOtpResponseDto } from './dto/recoverOtpResponse.dto';
import { Role } from 'src/authorization/entities/role.enum'

@Injectable()
export class AuthService {
    constructor(private firebaseService: FirebaseService, private jwtService: JwtService, private hashService: HashService, private usersService: UsersService, private sessionService: SessionService) { }

    async firebaseLogin(logInDto: LogInDto, singleUserSnap: any): Promise<LogInResponseDto> {

        const otp = logInDto.otp;

        if (!singleUserSnap) {
            throw new BadRequestException('WRONGCREDENTIALS');
        }

        let userEmail: string;
        if (logInDto.user.match('([a-z0-9._-]+)@([a-z0-9]+).([a-z]{2,10})(.[.a-z]{3,})?')) {
            userEmail = logInDto.user;
        }
        else {
            userEmail = singleUserSnap.get("email");
        }

        const hashedPassword = singleUserSnap.get("password")
        const doPasswordsMatch = await this.hashService.compareHashedStrings(
            logInDto.password,
            hashedPassword
        )
        const userOtpSecret: speakeasy.GeneratedSecret = singleUserSnap.get("otp_secret");
        const isOtpValid = speakeasy.totp.verify({
            secret: userOtpSecret.ascii,
            encoding: 'ascii',
            token: otp
        })
        if (!doPasswordsMatch) {
            throw new BadRequestException('WRONGCREDENTIALS');
        }
        if (!isOtpValid) {
            throw new BadRequestException('OTPINVALID');
        }
        let userCredential
        try {
            userCredential = await signInWithEmailAndPassword(this.firebaseService.auth, userEmail, hashedPassword);
        }
        catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }

        if (userCredential) {
            const idCredential: string = userCredential.user.uid;
            const emailCredential: string = userCredential.user.email;
            const payload = { email: emailCredential, id: idCredential };
            let sessionTime = await this.sessionService.getSessionTime(singleUserSnap);
            const token = this.jwtService.sign(payload, {
                secret: jwtSecret,
                expiresIn: sessionTime
            });
            let refreshTime = await this.sessionService.getRefreshTime(singleUserSnap);
            const refreshToken = this.jwtService.sign(payload, {
                secret: refreshSecret,
                expiresIn: refreshTime
            });
            const loginResponseDto: LogInResponseDto = { statusCode: 201, message: 'LOGINSUCCESSFUL', bearer_token: token, authCookieAge: sessionTime * cookieTimeMultiplier, refresh_token: refreshToken, refreshCookieAge: refreshTime * cookieTimeMultiplier };

            return loginResponseDto;
        }
        else {
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

        await this.usersService.emailChecker(email, false);

        const usersRef = collection(this.firebaseService.fireStore, "users");

        //query for checking if there is someone with the username in dto
        const customUserWhere: QueryFieldFilterConstraint = where("username", "==", username);
        const userQuery = query(usersRef, customUserWhere);
        const userQuerySnapshot = await getDocs(userQuery);

        if (!userQuerySnapshot.empty) {
            throw new BadRequestException('USERNAMEEXISTS');
        }

        try {
            let userCredential = await createUserWithEmailAndPassword(
                this.firebaseService.auth,
                email,
                hashedPassword
            );

            if (userCredential) {
                const otp_secret = speakeasy.generateSecret({
                    name: otpAppName
                })
                const id: string = userCredential.user.uid;
                let newUser: User = {
                    email: email,
                    username: username,
                    password: hashedPassword,
                    name: name,
                    security_answer: signUpDto.security_answer,
                    role: Role.SUBSCRIBER,
                    otp_secret: otp_secret
                };
                let docReference: DocumentReference = doc(this.firebaseService.usersCollection, id);
                await setDoc(docReference, newUser);
                const signUpDtoResponse: SignUpDtoResponse = { statusCode: 201, message: 'SIGNUPSUCCESSFUL', otp: otp_secret.otpauth_url };
                return signUpDtoResponse;
            }
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }

    }


    async firebaseRecoverPassword(recoverPasswordDto: RecoverPasswordDto): Promise<RecoverPasswordDtoResponse> {
        const { user, security_answer, new_password, otp } = recoverPasswordDto;

        let userID: string;
        if (user.match('([a-z0-9._-]+)@([a-z0-9]+).([a-z]{2,10})(.[.a-z]{3,})?')) {

            const emailQuerySnapshot = await this.usersService.emailChecker(user, true);
            const docSnapshot = emailQuerySnapshot.docs[0];
            userID = docSnapshot.id;
        }
        else if (user.match('^[A-Z](?=.{0}[a-z]+[-._]{1}[1-9]{1,4}$).{1,20}$')) {

            userID = await this.usersService.searchUser(user);
        }

        const singleUserReference = doc(this.firebaseService.usersCollection, userID);
        const singleUserSnap = await getDoc(singleUserReference);
        const doSecurityAnswersMatch = await this.hashService.compareHashedStrings(
            security_answer,
            singleUserSnap.get("security_answer")
        )
        if (!doSecurityAnswersMatch) {
            throw new BadRequestException('WRONGCREDENTIALS');
        }

        const userOtpSecret: speakeasy.GeneratedSecret = singleUserSnap.get("otp_secret");
        const isOtpValid = speakeasy.totp.verify({
            secret: userOtpSecret.ascii,
            encoding: 'ascii',
            token: otp
        })

        if (!isOtpValid) {
            throw new BadRequestException('OTPINVALID');
        }

        const hashedPassword = singleUserSnap.get("password");
        const newHashedPassword = await this.hashService.hashString(new_password);
        const email: string = singleUserSnap.get("email");
        const userCredential = await signInWithEmailAndPassword(this.firebaseService.auth, email, hashedPassword);

        if (userCredential) {

            try {
                const userUpdated = await firebaseAdminAuth.getAuth().updateUser(userID, {
                    password: newHashedPassword
                })

                if (userUpdated) {
                    await updateDoc(singleUserReference, {
                        password: newHashedPassword
                    });
                }
                else {
                    throw new BadRequestException('USERNOTFOUND');
                }

            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
            }

            try {
                this.firebaseService.auth.signOut;
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
            }
            const recoverPasswordDtoResponse: RecoverPasswordDtoResponse = { statusCode: 201, message: 'NEWPASSWORDASSIGNED' }

            this.firebaseService.auth.signOut;
            return recoverPasswordDtoResponse;
        }
        else {
            throw new BadRequestException('USERNOTFOUND');
        }


    }

    async firebaseRecoverOtp(recoverOtpDto: RecoverOtpDto): Promise<RecoverOtpResponseDto> {
        const { user, security_answer, password } = recoverOtpDto;

        let userID: string;
        if (user.match('([a-z0-9._-]+)@([a-z0-9]+).([a-z]{2,10})(.[.a-z]{3,})?')) {

            const emailQuerySnapshot = await this.usersService.emailChecker(user, true);
            const docSnapshot = emailQuerySnapshot.docs[0];
            userID = docSnapshot.id;
        }
        else if (user.match('^[A-Z](?=.{0}[a-z]+[-._]{1}[1-9]{1,4}$).{1,20}$')) {

            userID = await this.usersService.searchUser(user);
        }

        const singleUserReference = doc(this.firebaseService.usersCollection, userID);
        const singleUserSnap = await getDoc(singleUserReference);
        const doSecurityAnswersMatch = await this.hashService.compareHashedStrings(
            security_answer,
            singleUserSnap.get("security_answer")
        )
        if (!doSecurityAnswersMatch) {
            throw new BadRequestException('WRONGCREDENTIALS');
        }

        const doPasswordsMatch = await this.usersService.passwordCheck(password, singleUserSnap);

        if ((doPasswordsMatch) && (doSecurityAnswersMatch)) {
            const hashedPassword = singleUserSnap.get("password");
            try {
                const userCredential = await signInWithEmailAndPassword(this.firebaseService.auth, singleUserSnap.get("email"), hashedPassword);
                if (userCredential) {

                    const newOtpSecret = speakeasy.generateSecret({
                        name: otpAppName
                    })
                    await updateDoc(singleUserReference, {
                        otp_secret: newOtpSecret
                    })
                    const recoverOtpResponseDto: RecoverOtpResponseDto = { statusCode: 200, message: 'NEWOTPASSIGNED', otp: newOtpSecret.otpauth_url };

                    return recoverOtpResponseDto;
                }
                else {
                    throw new BadRequestException('USERNOTFOUND');
                }
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
            }
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

        const changePasswordDtoResponse: ChangePasswordDtoResponse = { statusCode: 200, message: 'NEWPASSWORDASSIGNED' }
        return changePasswordDtoResponse;
    }

    async firebaseLogout(): Promise<LogOutResponseDto> {
        try {
            this.firebaseService.auth.signOut;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }
        const logoutResponseDto: LogOutResponseDto = { statusCode: 200, message: 'LOGOUTSUCCESSFULL' }
        return logoutResponseDto;
    }


}