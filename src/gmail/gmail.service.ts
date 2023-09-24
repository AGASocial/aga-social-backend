import { Injectable } from '@nestjs/common';
import * as axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class GmailService {
    private tokens: any | null = null;

    getAuthorizationUrl(): string {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI;

        if (!clientId || !redirectUri) {
            throw new Error('Missing or Incorrect credentials.');
        }

        const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=https://www.googleapis.com/auth/gmail.send&access_type=offline&response_type=code`;

        return authUrl;
    }

    async getTokensFromCode(code: string): Promise<any> {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI;

        if (!clientId || !clientSecret || !redirectUri) {
            throw new Error('Missing or Incorrect credentials. Make sure to define GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in the .env file.');
        }

        const tokenUrl = 'https://accounts.google.com/o/oauth2/token';
        const data = {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        };

        try {
            const response = await axios.default.post(tokenUrl, null, {
                params: data,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            const tokens = response.data;
            this.tokens = tokens;
            return tokens;
        } catch (error) {
            throw new Error('Error getting access tokens: ' + error.message);
        }
    }

    setCredentials(tokens: any) {
        this.tokens = tokens;
    }

    async sendEmail(subject: string, message: string, to: string): Promise<any> {
        if (!this.tokens) {
            throw new Error('Access tokens not available. Make sure to obtain tokens first.');
        }

        const email = {
            to,
            subject,
            message,
        };

        const apiUrl = 'https://www.googleapis.com/gmail/v1/users/me/messages/send';
        const headers = {
            Authorization: `Bearer ${this.tokens.access_token}`,
            'Content-Type': 'application/json',
        };

        try {
            const response = await axios.default.post(apiUrl, email, {
                headers,
            });
            return response.data;
        } catch (error) {
            throw new Error('Error sending email: ' + error.message);
        }
    }
}
