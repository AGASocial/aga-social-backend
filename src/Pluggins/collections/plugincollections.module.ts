import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../../firebase/firebase.service';
import { PluginCollectionsController } from './plugincollections.controller';
import { PluginCollectionsService } from './plugincollections.service';

@Module({
    imports: [ConfigModule],
    controllers: [PluginCollectionsController],
    providers: [PluginCollectionsService, FirebaseService],
    exports: [PluginCollectionsService]
})
export class PluginCollectionsModule { }
