import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { SectionService } from './sections.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, SectionService],
    exports: [SectionService]
})
export class SectionModule { }
