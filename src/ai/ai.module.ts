/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { FirebaseService } from '../firebase/firebase.service';
import { ConfigService } from '@nestjs/config';
import { OpenAiService } from './openai/openai.service';

@Module({
    controllers: [AiController],
    providers: [AiService, FirebaseService, ConfigService, OpenAiService],
})
export class AiModule { }
