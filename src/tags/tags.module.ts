import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { TagsService } from './tags.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, TagsService],
    exports: [TagsService]
})
export class TagsModule { }
