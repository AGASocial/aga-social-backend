import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { cookieAge, cookieSecret, csrfCookieName, csrfSecret, doubleCsrfProtection, jwtCookieSecret } from './utils/constants';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { ServiceAccount } from "firebase-admin";
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService: ConfigService = app.get(ConfigService);

 

    const adminConfig: ServiceAccount = {
        "projectId": configService.get<string>('FIREBASE_PROJECT_ID'),
        "privateKey": configService.get<string>('FIREBASE_PRIVATE_KEY')
            .replace(/\\n/g, '\n'),
        "clientEmail": configService.get<string>('FIREBASE_CLIENT_EMAIL'),
    };

    console.log('Before Firebase Auth');
    try {
        await admin.initializeApp({
            credential: admin.credential.cert(configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS')),
           // databaseURL: configService.get<string>('FIREBASE_DATA_URL'),
            storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
            databaseAuthVariableOverride: {
                uid: configService.get<string>('FIREBASE_AUTH_UID')
            },
        });
        console.log('Firebase Auth initialized successfully.');
    } catch (error) {
        console.error('Error initializing Firebase Auth:', error);
    }


    const { initializeApp } = require('firebase-admin/app');

  
        

    const config = new DocumentBuilder()
        .setTitle('AGA Social Content Backend')
        .setDescription('API para la gestion de recursos digitales de AGA Social')
        .setVersion('0.1.1')
        .addTag('agasocial')
        .build()
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    app.use(
        session({
            secret: cookieSecret,
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: cookieAge },
            rolling: true,
        })
    );


    app.use(helmet());
    app.enableCors();
    app.use(cookieParser(jwtCookieSecret));
    app.use(passport.initialize());
    app.use(passport.session());

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
    }));

    const port = process.env.PORT || 3000; 
    await app.listen(port);
    console.log(`App listening on port ${port}`);
  //await app.listen(3000);
}



bootstrap();
