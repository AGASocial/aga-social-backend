import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const gmailSend = require('gmail-send');

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

  async sendEmail(to: string, subject: string, text: string) {
    try {
      const send = gmailSend({
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_PASSWORD'),
        to,
        subject,
        text,
      });

      const result = await send();
      return { success: true, message: 'Email sent successfully', result };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
