import { HttpException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin'
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios'
import { jwtConstants } from 'src/auth/constants';
import { AxiosResponse } from 'axios'
import { Observable, tap, map, async, catchError } from 'rxjs';
import { userDTO } from './dto/user.dto';
import { PassworduserDTO } from './dto/password.user.dto';
import { useremailDTO } from './dto/user.email.dto';
import { ConfigService } from "@nestjs/config";
import * as SendGrid from '@sendgrid/mail';
import { FindPluginPayDTO } from 'src/pluggin/dto/Find-plugin-pay.dto';



export type User = any;


@Injectable()
export class UsersService {

    constructor(private jwtService: JwtService, private readonly httpService: HttpService, private readonly configService: ConfigService) {
        SendGrid.setApiKey(this.configService.get<string>('SEND_GRID_KEY'));


    }


    async sign_in_with_email_and_password(email: string, password: String) {
        try {
            const resp = await this.httpService.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + this.configService.get<string>('REST_KEY'), { email: email, password: password, "returnSecureToken": true }).toPromise();

            const user = await admin.firestore().collection('users').doc(resp.data.localId).get();

            const mainDocs2 = [];

            if (user.exists) {
                let role = 'default role'; // Valor por defecto si la propiedad 'role' no está definida en Firestore

                if (user.data().role) {
                    // Si la propiedad 'role' está definida en el documento de usuario en Firestore
                    role = user.data().role;
                }
                
                // Buscar el documento de role correspondiente al 'id' del rol en Firestore
                const rolesCollection = admin.firestore().collection('roles');
                const roleDoc = await rolesCollection.doc(role).get();

                if (roleDoc.exists) {
                    // Si se encuentra el documento de role en Firestore
                    mainDocs2.push({ ...resp.data, role: roleDoc.data().name });
                } else {
                    // Si no se encuentra el documento de role en Firestore
                    mainDocs2.push({ ...resp.data, role: 'Role not found' });
                }
            } else {
                // Si no se encuentra el documento de usuario en Firestore
                mainDocs2.push({ ...resp.data, role: 'User not found' });
            }

            return mainDocs2;
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }

    public async Changepassword(userDto: PassworduserDTO) {
        const { password, email } = userDto;

        try {
            var uid = await admin.auth().getUserByEmail(userDto.email).then((userRecord) => { return userRecord.uid });
            await admin.auth().updateUser(uid, { password: userDto.password, }).then((userRecord) => {
                return userRecord.toJSON();
            })
                .catch((error) => {
                    console.log('Error updating user:', error);
                });

        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }



    public async create_user(userDto: userDTO) {
        const { displayName, password, email, role } = userDto;

        try {
            const { uid } = await admin.auth().createUser({
                displayName,
                password,
                email
            });
            await admin.auth().setCustomUserClaims(uid, { role });
            admin.firestore().collection('users').doc(uid)
                .set({
                    displayName: displayName,
                    email: email,
                    role: role
                })
            return { uid };
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }

    public async listusers() {

        try {
            const listUsers = await admin.auth().listUsers()
            const users = listUsers.users.map(user => {
                return {

                    uid: user.uid,

                    email: user.email,


                    displayName: user.displayName,

                    lastSignInTime: user.metadata.lastSignInTime,

                    creationTime: user.metadata.creationTime

                }

            })
            return { users }
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }
 
    async password_resert(email: string) {
        {
            try {

                return await this.httpService.post('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' + this.configService.get<string>('REST_KEY'), {requestType: 'PASSWORD_RESET', email: email }).pipe(
                    tap((resp) => console.log(resp)),
                    map((resp) => resp.data),
                    tap((data) =>  console.log(data)),
                  );
                
            } catch (error) {
                throw new UnauthorizedException(error.message);
            }
        }
    }

    async findpluginPay(uid: string) {
        try {
            const collection = await admin.firestore().collection(this.configService.get<string>('COLLECTION_COMPANYPLUGIN')).where('client_uid', '==', uid).get();
            const mainDocs = [];
            const mainDocs2 = [];

            collection.forEach(async doc => {
                mainDocs.push({ ...doc.data(), _id: doc.id });
            })
            for (const doc of mainDocs) {
                const plugindata = await admin.firestore().collection(this.configService.get<string>('COLLECTION_PLUGIN')).doc(doc.plugin_uid).get().then
                    (querySnapshot => {
                        mainDocs2.push({ ...doc, ...querySnapshot.data() });
                    })
            }
            return await mainDocs2;
        }
        catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }



}