import { Injectable } from '@nestjs/common';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import {
  CollectionReference,
  Firestore,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  limit,
  DocumentReference,
  doc,
} from 'firebase/firestore';
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

  public promptsCollection: CollectionReference;
  public usersCollection: CollectionReference;
  public rolesCollection: CollectionReference;
  public mediaCollection: CollectionReference;
  public ebooksCollection: CollectionReference;
  public sectionsCollection: CollectionReference;
  public coursesCollection: CollectionReference;
  public messagesCollection: CollectionReference;
  public couponsCollection: CollectionReference;
  public tagsCollection: CollectionReference;
  public pluginsCollection: CollectionReference;
  public emailsSubcollection: CollectionReference;
  public usersSubcollection: CollectionReference;

  public collectionCaches: { [collectionName: string]: any[] } = {};
  private cache = {
    users: [],
    roles: [],
    media: [],
    ebooks: [],
    sections: [],
    courses: [],
    messages: [],
    coupons: [],
    tags: [],
    // plugins: []
  };

  constructor(private configService: ConfigService<Config>) {
    const firebaseConfig = {
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
      databaseAuthVariableOverride: {
        uid: configService.get<string>('FIREBASE_AUTH_UID'),
      },
      apiKey: configService.get<string>('FIREBASE_API_KEY') || 'mock_key',
      authDomain: configService.get<string>('FIREBASE_AUTH_DOMAIN'),
      projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
      messagingSenderId: configService.get<string>(
        'FIREBASE_MESSAGING_SENDER_ID',
      ),
      appId: configService.get<string>('FIREBASE_APP_ID'),
      measurementId: configService.get<string>('MEASUREMENT_ID'),
    };

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.fireStore = getFirestore(this.app);

    this._createUsersCollection();
    this._createRolesCollection();
    this._createMediaCollection();
    this._createEbooksCollection();
    this._createSectionsCollection();
    this._createCoursesCollection();
    this._createMessagesCollection();
    this._createCouponsCollection();
    this._createTagsCollection();
    this._createPluginsCollection();
    this._createPromptsCollection;
    this.initializeCollectionCaches();
  }

  private _createPluginsCollection() {
    const pluginsCollectionRef = collection(this.fireStore, 'newPlugins');
    const pluginDocumentRef: DocumentReference = doc(pluginsCollectionRef);
    const emailsCollectionRef = collection(pluginDocumentRef, 'emails');
    const usersCollectionRef = collection(pluginDocumentRef, 'pluginUsers');
  }

  private _createTagsCollection() {
    this.tagsCollection = collection(this.fireStore, 'tags');
  }

  private _createCouponsCollection() {
    this.couponsCollection = collection(this.fireStore, 'coupons');
  }

  private _createMessagesCollection() {
    this.messagesCollection = collection(this.fireStore, 'messages');
  }

  private _createPromptsCollection() {
    this.promptsCollection = collection(this.fireStore, 'prompts');
  }

  private _createCoursesCollection() {
    this.coursesCollection = collection(this.fireStore, 'courses');
  }

  private _createSectionsCollection() {
    this.sectionsCollection = collection(this.fireStore, 'sections');
  }

  private _createEbooksCollection() {
    this.ebooksCollection = collection(this.fireStore, 'ebooks');
  }

  private _createMediaCollection() {
    this.mediaCollection = collection(this.fireStore, 'media');
  }

  private _createUsersCollection() {
    this.usersCollection = collection(this.fireStore, 'users');
  }

  private _createRolesCollection() {
    this.rolesCollection = collection(this.fireStore, 'roles');
  }

  //Methods for Firebase Cache

  private async initializeCollectionCaches() {
    const collections = [
      this.usersCollection,
      this.rolesCollection,
      this.mediaCollection,
      this.ebooksCollection,
      this.sectionsCollection,
      this.coursesCollection,
      this.messagesCollection,
      this.couponsCollection,
      this.tagsCollection,
    ];

    for (const collectionRef of collections) {
      const collectionName = collectionRef.id;
      const collectionSnapshot = await getDocs(collectionRef);
      const collectionData = collectionSnapshot.docs.map((doc) => doc.data());
      this.cache[collectionName] = collectionData;
    }
  }

  async loadCollectionCache(collectionName: string): Promise<any[]> {
    const collectionRef = collection(this.fireStore, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    const cacheData = [];
    querySnapshot.forEach((doc) => {
      cacheData.push(doc.data());
    });
    this.collectionCaches[collectionName] = cacheData;
    return cacheData;
  }

  async getCollectionData(collectionName: string): Promise<any[]> {
    return this.cache[collectionName];
  }

  setCollectionData(collectionName: string, data: any[]): void {
    this.collectionCaches[collectionName] = data;
  }

  async getUserByEmail(email: string): Promise<any> {
    const usersRef = collection(this.fireStore, 'users');
    const emailQuery = query(usersRef, where('email', '==', email), limit(1));
    const emailQuerySnapshot = await getDocs(emailQuery);
    return emailQuerySnapshot.empty ? null : emailQuerySnapshot.docs[0].data();
  }

  async getMediaByUrl(url: string): Promise<any> {
    const mediaRef = collection(this.fireStore, 'media');
    const mediaQuery = query(mediaRef, where('url', '==', url), limit(1));
    const mediaQuerySnapshot = await getDocs(mediaQuery);
    return mediaQuerySnapshot.empty ? null : mediaQuerySnapshot.docs[0].data();
  }
}
