import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const gmailSend = require('gmail-send');

@Injectable()
export class EmailService {
  private readonly sender;

  constructor(private configService: ConfigService) {
    // Initialize the sender configuration once in the constructor
    this.sender = gmailSend({
      user: this.configService.get<string>('GMAIL_USER'),
      pass: this.configService.get<string>('GMAIL_PASSWORD'),
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    // Validate inputs first
    if (!to || !subject || !text) {
      throw new BadRequestException('Email recipient, subject, and text are required');
    }

    try {
      const result = await this.sender({
        to,
        subject,
        text,
      });
      
      console.log('Email sent successfully');
      return { success: true, message: 'Email sent successfully', result };
    } catch (error) {
      console.error('Failed to send email:', error);
      // If it's already a NestJS exception, rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Otherwise, wrap it in a BadRequestException
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }
}
