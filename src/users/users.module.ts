import { Module } from '@nestjs/common'; //Para poder usar el decorador Module
import { UsersService} from './users.service';
import { FirebaseService } from 'src/firebase/firebase.service'; //Conexion Firebase
import { HashService } from 'src/utils/hash.service'; //Para Hashear
import { JwtModule } from '@nestjs/jwt'; //Tiene que ver con la autenticacion y los tokens
import { ConfigModule } from '@nestjs/config'; //Usado para configurar variables de entorno o archivos de config rapidamente
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [JwtModule.register({}), ConfigModule.forRoot(), RolesModule],
  providers: [UsersService, FirebaseService, HashService],
  exports: [UsersService]
})
export class UsersModule {}
