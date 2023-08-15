import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  imports: [ConfigModule],
  providers: [RolesService, FirebaseService],
  exports: [RolesService]
})
export class RolesModule {}
