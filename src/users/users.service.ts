import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { collection, QueryFieldFilterConstraint, where, limit, getDocs, DocumentData, query, doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { GeneratedSecret } from 'speakeasy'; 
import { FirebaseService } from '../firebase/firebase.service';
import { RolesService } from '../roles/roles.service';
import { HashService } from '../utils/hash.service';

@Injectable()
export class UsersService {
    constructor(private firebaseService: FirebaseService, private hashService: HashService, private jwtService: JwtService, private rolesService: RolesService){}



    @ApiOkResponse({ description: 'Email check successful'})
    @ApiBadRequestResponse({ description: 'Wrong credentials or email exists' })
    async emailChecker(email: string, isEmailWanted: boolean) {
        const usersRef = collection(this.firebaseService.fireStore, "users");

        //query for checking if there is someone with the email in dto
        const customEmailWhere: QueryFieldFilterConstraint = where("email","==",email);
        const emailQuery = query(usersRef,customEmailWhere,limit(1)); 
        const emailQuerySnapshot = await getDocs(emailQuery);

        if (emailQuerySnapshot.empty == isEmailWanted) {
            if (isEmailWanted == true){
                throw new BadRequestException('WRONGCREDENTIALS');
            }
            else if (isEmailWanted == false){
                throw new BadRequestException('The email is already registered in another account');
            }
        }
        console.log('Email Checker - Email:', email);
        console.log('Email Checker - isEmailWanted:', isEmailWanted);

        return emailQuerySnapshot;
    }



    @ApiOkResponse({ description: 'User found successfully', type: String })
    @ApiBadRequestResponse({ description: 'User does not exist' })
    async searchUser(username: string) {
        const usersRef = this.firebaseService.usersCollection;

        const customUsernameWhere: QueryFieldFilterConstraint = where("username", "==", username);
        const userQuery = query(usersRef, customUsernameWhere, limit(1));
        const userQuerySnapshot = await getDocs(userQuery);

        if (userQuerySnapshot.empty) {
            throw new BadRequestException('USERDOESNOTEXIST');
        }
        const docSnapshot = userQuerySnapshot.docs[0];
        console.log('Search User - Username:', username);

        return docSnapshot.id;
    }




    @ApiOkResponse({ description: 'User retrieved successfully' })
    @ApiBadRequestResponse({ description: 'User does not exist' })
    async getUserById(userId: string) {
        const usersCollection = this.firebaseService.usersCollection;
        const userReference = doc(usersCollection, userId);
        const userSnap = await getDoc(userReference);
        if(!userSnap.exists()){
            throw new BadRequestException('USERDOESNOTEXIST');
        }
        return userSnap;
    }



    @ApiOkResponse({ description: 'User role retrieved successfully.', type: String })
    @ApiBadRequestResponse({ description: 'User role does not exist.', type: BadRequestException })
    async getUserRole(user: any): Promise<string | null> {
        const userRole = user?.role; 

        if (typeof userRole !== 'undefined') {
            try {
                const roleSnap = await this.rolesService.getRole(userRole);
                if (roleSnap == null) {
                    throw new BadRequestException('USERHASNONEXISTINGROLE');
                }
                console.log('Get User Role - User Role:', userRole);
                return userRole; 
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
                return null; 
            }
        } else {
            return null; 
        }
    }




    async passwordCheck(password: string, firestoreUserSnap: any): Promise<boolean> {
        const doPasswordsMatch: boolean = await this.hashService.compareHashedStrings(
            password,
            firestoreUserSnap.get("password")
        ) as boolean;

        if (!doPasswordsMatch) {
            throw new BadRequestException('WRONGCREDENTIALS');
        }

        console.log('Password Check - Do Passwords Match:', doPasswordsMatch);
        return doPasswordsMatch;
    }



    extractID(jwtToken: string): string | null {
        try {
            const payload: any = this.jwtService.decode(jwtToken);

            const userId: string = payload.id;
            console.log('Extract ID - User ID');

            return userId;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return null; 
        }
    }



    @ApiOkResponse({ description: 'Password is correct.', type: Boolean })
    @ApiBadRequestResponse({ description: 'Password is incorrect.', type: BadRequestException })
    extractEmail(jwtToken: string): string | null {
        try {
           
            const payload: any = this.jwtService.decode(jwtToken);

            const userEmail: string = payload.email;
            console.log('Extract Email - User Email');
            return userEmail;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return null;
        }
    }



    @ApiOkResponse({ description: 'Expiration timestamp extracted.', type: Number })
    @ApiOkResponse({ description: 'Failed to extract expiration timestamp.', type: null })
    extractExpiration(jwtToken: string): number | null {
        try {
            const payload: any = this.jwtService.decode(jwtToken);

            const expiration: number = payload.exp;
            console.log('Extract Expiration - Token Expiration:');

            return expiration;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return null;
        }
    }


}
