import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { MessageService } from './message.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, MessageService],
    exports: [MessageService]
})
export class MessageModule { }
