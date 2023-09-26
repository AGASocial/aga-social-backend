import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../../firebase/firebase.service';
import { UsersService } from '../../users/users.service';
import { HashService } from '../../utils/hash.service';
import { PluginUsersService } from './pluginsUsers.service';
import { PluginUsersController } from './pluginUsers.controller';

@Module({
    imports: [ConfigModule],
    controllers: [PluginUsersController],
    providers: [PluginUsersService, FirebaseService, HashService],
    exports: [PluginUsersService]
})
export class PluginUsersModule { }
