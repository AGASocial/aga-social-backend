import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { collection, QueryFieldFilterConstraint, where, limit, getDocs, DocumentData, query, doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { GeneratedSecret } from 'speakeasy'; 
import { FirebaseService } from 'src/firebase/firebase.service'; //Listo
import { RolesService } from 'src/roles/roles.service'; //Listo
import { HashService } from 'src/utils/hash.service'; //Listo

@Injectable()
export class UsersService {
    constructor(private firebaseService: FirebaseService, private hashService: HashService, private jwtService: JwtService, private rolesService: RolesService){}

    async emailChecker(email: string, isEmailWanted: boolean) {
        const usersRef = collection(this.firebaseService.fireStore, "users");

        //query for checking if there is someone with the email in dto
        const customEmailWhere: QueryFieldFilterConstraint = where("email","==",email);
        const emailQuery = query(usersRef,customEmailWhere,limit(1)); //Arma la consulta, usersRef es la tabla users, customEmailWhere es el filtro/constraint y limit es para que solo traiga un user
        const emailQuerySnapshot = await getDocs(emailQuery);

        if (emailQuerySnapshot.empty == isEmailWanted) {
            if (isEmailWanted == true){
                throw new BadRequestException('WRONGCREDENTIALS');
            }
            else if (isEmailWanted == false){
                throw new BadRequestException('EMAILEXISTS');
            }
        }
        return emailQuerySnapshot;
    }

    async searchUser(username: string) {
        const usersRef = this.firebaseService.usersCollection;

        const customUsernameWhere: QueryFieldFilterConstraint = where("username", "==", username);
        const userQuery = query(usersRef, customUsernameWhere, limit(1));
        const userQuerySnapshot = await getDocs(userQuery);

        if (userQuerySnapshot.empty) {
            throw new BadRequestException('USERDOESNOTEXIST');
        }
        const docSnapshot = userQuerySnapshot.docs[0];
        return docSnapshot.id;
    }

    async getUserById(userId: string) {
        const usersCollection = this.firebaseService.usersCollection;
        const userReference = doc(usersCollection, userId);
        const userSnap = await getDoc(userReference);
        if(!userSnap.exists()){
            throw new BadRequestException('USERDOESNOTEXIST');
        }
        return userSnap;
    }

    async getUserOtpSecret(userSnap: DocumentSnapshot): Promise<GeneratedSecret> {
        let userOtpSecret = await userSnap.get("otp_secret");
        return userOtpSecret;
    }

    async getUserRole(userSnap: DocumentSnapshot): Promise<string | null> {
        const userRole = await userSnap.get("role");

        if (typeof userRole !== 'undefined') {
            try {
                const roleSnap = await this.rolesService.getRole(userRole);
                if (roleSnap == null) {
                    throw new BadRequestException('USERHASNONEXISTINGROLE');
                }
                return userRole; // Retorna el rol del usuario si existe y es válido
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
                return null; // Retorna null en caso de error o rol inválido
            }
        } else {
            return null; // Retorna null si el usuario no tiene un rol asignado
        }
    }



    async passwordCheck(password: string, firestoreUserSnap: DocumentSnapshot): Promise<boolean> {
        const doPasswordsMatch: boolean = await this.hashService.compareHashedStrings(
            password,
            firestoreUserSnap.get("password")
        )as boolean;
        if (!doPasswordsMatch) {
            throw new BadRequestException('WRONGCREDENTIALS');
        }

        return doPasswordsMatch; // Retorna true si las contraseñas coinciden, de lo contrario, se lanzará la excepción antes.
    }


    extractID(jwtToken: string): string | null {
        try {
            // Decodificar el token JWT y obtener el payload
            const payload: any = this.jwtService.decode(jwtToken);

            // Obtener el ID del usuario del payload (suponiendo que el campo es "id")
            const userId: string = payload.id;

            return userId;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return null; // Retorna null en caso de error al decodificar o si no se encuentra el ID en el payload
        }
    }


    extractEmail(jwtToken: string): string | null {
        try {
            // Decodificar el token JWT y obtener el payload
            const payload: any = this.jwtService.decode(jwtToken);

            // Obtener el correo electrónico del usuario del payload (suponiendo que el campo es "email")
            const userEmail: string = payload.email;

            return userEmail;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return null; // Retorna null en caso de error al decodificar o si no se encuentra el correo electrónico en el payload
        }
    }


    extractExpiration(jwtToken: string): number | null {
        try {
            // Decodificar el token JWT y obtener el payload
            const payload: any = this.jwtService.decode(jwtToken);

            // Obtener la fecha de expiración del token del payload (campo "exp")
            const expiration: number = payload.exp;

            return expiration;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return null; // Retorna null en caso de error al decodificar o si no se encuentra la fecha de expiración en el payload
        }
    }


}
