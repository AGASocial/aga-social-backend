import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { VimeoService } from '../vimeo/vimeo.service';
import { MediaService } from './media.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, MediaService, VimeoService],
    exports: [MediaService]
})
export class MediaModule { }
