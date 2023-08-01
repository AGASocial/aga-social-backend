import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [UsersModule, RolesModule],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule {}
