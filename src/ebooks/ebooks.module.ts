import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { EbookService } from './ebooks.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, EbookService],
    exports: [EbookService]
})
export class EbookModule { }
