/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { FirebaseService } from '../firebase/firebase.service';
import { ConfigService } from '@nestjs/config';

@Module({
    controllers: [AiController],
    providers: [AiService, FirebaseService, ConfigService],
})
export class AiModule { }
