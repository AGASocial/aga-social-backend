import { Module } from '@nestjs/common'; //Para poder usar el decorador Module
import { UsersService} from './users.service';
import { JwtModule } from '@nestjs/jwt'; //Tiene que ver con la autenticacion y los tokens
import { ConfigModule } from '@nestjs/config'; //Usado para configurar variables de entorno o archivos de config rapidamente
import { FirebaseService } from '../firebase/firebase.service';
import { RolesModule } from '../roles/roles.module';
import { HashService } from '../utils/hash.service';

@Module({
  imports: [JwtModule.register({}), ConfigModule.forRoot(), RolesModule],
  providers: [UsersService, FirebaseService, HashService],
  exports: [UsersService]
})
export class UsersModule {}
