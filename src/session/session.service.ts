import { Injectable } from '@nestjs/common';
import { DocumentSnapshot } from 'firebase/firestore';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';
import { timeMultiplier, jwtTime, refreshTime } from 'src/utils/constants';

@Injectable()
export class SessionService {
    constructor(private usersService: UsersService, private rolesService: RolesService) { }

    async getSessionTime(userSnap: DocumentSnapshot): Promise<number> {
        let sessionTime = Number(jwtTime);
        const userRole = await this.usersService.getUserRole(userSnap);

        if (userRole) {
            const roleSnap = await this.rolesService.getRole(userRole);
            const roleSessionTime: number = roleSnap.get("session_time");
            sessionTime = roleSessionTime;
        }

        sessionTime *= timeMultiplier;

        return sessionTime;
    }



    async getRefreshTime(userSnap: DocumentSnapshot): Promise<number> {
        let userRefreshTime = 0;
        const userRoles = await this.usersService.getUserRole(userSnap);

        if (userRoles.length !== 0) {
            const roleSnap = await this.rolesService.getRole(userRoles[0]);
            userRefreshTime = roleSnap.get("refresh_time") * timeMultiplier;
        } else {
            userRefreshTime = Number(refreshTime) * timeMultiplier;
        }

        const jwtRefreshTime = String(userRefreshTime).concat("s");
        return userRefreshTime;
    }










}