import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { EbookService } from './ebooks.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, EbookService],
    exports: [EbookService]
})
export class EbookModule { }
