import { Module } from '@nestjs/common';
import { AbilityFactory } from './factory/ability.factory';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
    imports: [UsersModule, RolesModule, ConfigModule],
    providers: [AbilityFactory, ConfigService],
    exports: [AbilityFactory]
})
export class AbilityModule {}
