import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../../firebase/firebase.service';
import { GmailService } from '../../gmail/gmail.service';
import { UsersService } from '../../users/users.service';
import { HashService } from '../../utils/hash.service';
import { EmailsService } from './pluginEmails.service';
import { EmailsController } from './pluginsEmails.controller';

@Module({
    imports: [ConfigModule],
    controllers: [EmailsController],
    providers: [EmailsService, FirebaseService, HashService, GmailService],
    exports: [EmailsService]
})
export class EmailsModule { }
