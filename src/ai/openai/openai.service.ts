/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';


@Injectable()
export class OpenAiService {
    private openai: OpenAI;

    constructor() {
        this.initializeOpenAi();
    }

    public initializeOpenAi(): void {
        if (!this.openai) {
            console.log('Init openai config');
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                console.error('Error: OPENAI_API_KEY environment variable is not set');
                throw new Error('OPENAI_API_KEY environment variable is not set');
            }

            this.openai = new OpenAI({
                apiKey: apiKey
            });

            console.log('OpenAI initialized:');
        }
    }

    async getOpenAI() {
        await this.initializeOpenAi();
        return this.openai;
    }

  
}
