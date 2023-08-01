import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [RolesService, FirebaseService],
  exports: [RolesService]
})
export class RolesModule {}
