import { Module } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { SessionService } from './session.service';

@Module({
  imports: [UsersModule, RolesModule],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule {}
