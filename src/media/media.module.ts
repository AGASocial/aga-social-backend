import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { MediaService } from './media.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, MediaService],
    exports: [MediaService]
})
export class MediaModule { }
