import { Injectable } from '@nestjs/common';
import { google, Auth } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();




@Injectable()
export class GmailService {
    private oAuth2Client: Auth.OAuth2Client;
    private tokens: Auth.Credentials | null = null;
    constructor() {
        this.oAuth2Client = this.createOAuth2Client();
    }

     createOAuth2Client(): Auth.OAuth2Client {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI;

        if (!clientId || !clientSecret || !redirectUri) {
            throw new Error('Missing or Incorrect credentials. Make sure to define GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in the .env file.');
        }

        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri
        );

        return oauth2Client;
    }

    // Method to get the authorization URL
    getAuthorizationUrl(): string {
        const SCOPES = ['https://www.googleapis.com/auth/gmail.send']; // Permission to send emails

        const authUrl = this.oAuth2Client.generateAuthUrl({
            access_type: 'offline', 
            scope: SCOPES,
        });

        return authUrl;
    }

    // Method to exchange the authorization code for access and refresh tokens
    async getTokensFromCode(code: string): Promise<Auth.Credentials> {
        const { tokens } = await this.oAuth2Client.getToken(code);
        this.tokens = tokens;
        return tokens;
    }


    setCredentials(tokens: Auth.Credentials) {
        this.oAuth2Client.setCredentials(tokens);
    }



    getStoredTokens(): Auth.Credentials | null {
        return this.tokens;
    }



}
