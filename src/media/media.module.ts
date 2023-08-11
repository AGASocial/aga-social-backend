import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { MediaService } from './media.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, MediaService],
    exports: [MediaService]
})
export class MediaModule { }
