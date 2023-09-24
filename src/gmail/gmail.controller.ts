import { Body, Controller, Get, Post, Query, Redirect, Req, Res } from '@nestjs/common';
import { Request } from 'express';
import { GmailService } from './gmail.service';

@Controller()
export class AuthController {
    constructor(private readonly gmailService: GmailService) { }


    //First, redirect the client to the auth url
    @Get('gmail')
    @Redirect()
    async getGmailAuthorizationUrl(@Req() request: Request) {
        const authUrl = this.gmailService.getAuthorizationUrl();
        return { url: authUrl };
    }


    //Second, using the code from the authUrl, exchange the code for the tokens and set them
    @Post('gmail/auth/tokens')
    async setTokens(@Body() { code }: { code: string }) {
        try {
            const tokens = await this.gmailService.getTokensFromCode(code);
            this.gmailService.setCredentials(tokens);
            return { message: 'Tokens set successfully' };
        } catch (error) {
            throw error;
        }
    }


    //Finally, send the message on behalf of the user
    @Post('gmail/messages')
    async sendEmail(@Body() { subject, message, to }: { subject: string, message: string, to: string }) {
        try {
            const result = await this.gmailService.sendEmail(subject, message, to);
            return { message: 'Email sent successfully', result };
        } catch (error) {
            throw error;
        }
    }



}
