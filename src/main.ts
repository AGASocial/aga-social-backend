/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { cookieAge, cookieSecret, jwtCookieSecret } from './utils/constants';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { OpenAiService } from './ai/openai/openai.service';
import * as cors from 'cors';
dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    // Make OpenAI initialization optional
    try {
        app.get(OpenAiService).initializeOpenAi();
    } catch (error) {
        console.warn('OpenAI initialization skipped:', error.message);
    }
    
    const configService: ConfigService = app.get(ConfigService);

    // Enable CORS, allow multiple origins
    // CORS_ORIGIN should be a comma separated list of allowed origins (ex: http://localhost:3000,http://localhost:3001)
    app.use(cors({
        origin: (origin, callback) => {
          const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
          if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        exposedHeaders: ['Authorization', 'Refreshtoken', 'Sessionid', 'authCookieAge', 'refreshCookieAge'],
      }));

    const firebaseConfig = {
        credential: admin.credential.cert({
            projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
            clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
            privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        }),
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
    };

    try {
        await admin.initializeApp(firebaseConfig);
        console.log('Firebase Auth initialized successfully.');
    } catch (error) {
        console.error('Error initializing Firebase Auth:', error);
    }

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
}

export { admin };
bootstrap();
