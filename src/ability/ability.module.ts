import { Module } from '@nestjs/common';
import { AbilityFactory } from './factory/ability.factory';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule, RolesModule, ConfigModule],
    providers: [AbilityFactory, ConfigService],
    exports: [AbilityFactory]
})
export class AbilityModule {}
