
import { Injectable } from '@nestjs/common';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth'
import { CollectionReference, Firestore, getFirestore, collection } from 'firebase/firestore'
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/models/config.model';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

export const firebaseAdmin = admin;

@Injectable()
export class FirebaseService {
    public app: FirebaseApp;
    public auth: Auth;
    public fireStore: Firestore;

    public usersCollection: CollectionReference;
    public rolesCollection: CollectionReference;
   
    constructor(private configService: ConfigService<Config>) {
        const firebaseConfig = {
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }), databaseURL: configService.get<string>('FIREBASE_DATA_URL'),
            storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
            databaseAuthVariableOverride: {
                uid: configService.get<string>('FIREBASE_AUTH_UID')
            },
            apiKey: configService.get<string>('FIREBASE_API_KEY') || 'mock_key',
            authDomain: configService.get<string>('FIREBASE_AUTH_DOMAIN'),
            projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
            messagingSenderId: configService.get<string>('FIREBASE_MESSAGING_SENDER_ID'),
            appId: configService.get<string>('FIREBASE_APP_ID'),
            measurementId: configService.get<string>('MEASUREMENT_ID')
        }

  /*  constructor() {
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY || 'mock_key',
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.FIREBASE_DATA_URL,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.MEASUREMENT_ID
        };*/

           

        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.fireStore = getFirestore(this.app)
        this._createUsersCollection();
        this._createRolesCollection();


       
    }


    private _createUsersCollection() {
        this.usersCollection = collection(this.fireStore, 'users');
    }

    private _createRolesCollection() {
        this.rolesCollection = collection(this.fireStore, 'roles');
    }
    
}



