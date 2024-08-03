import { Injectable } from '@nestjs/common';
import { DocumentSnapshot } from 'firebase/firestore';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { jwtTime, refreshTime, timeMultiplier } from '../utils/constants';

@Injectable()
export class SessionService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  async getSessionTime(user: any): Promise<number> {
    console.log('getSessionTime executing...');

    let sessionTime = Number(jwtTime);
    const userSnap: DocumentSnapshot = user?.snapshot;

    if (userSnap) {
      const userRole = await this.usersService.getUserRole(userSnap);

      if (userRole) {
        console.log('User has role. Getting role session time...');
        const roleSnap = await this.rolesService.getRole(userRole);
        const roleSessionTime: number = roleSnap.get('session_time');
        sessionTime = roleSessionTime;
      }
    }

    sessionTime *= timeMultiplier;

    return sessionTime;
  }

  async getRefreshTime(user: any): Promise<number> {
    console.log('getRefreshTime executing...');

    let userRefreshTime = 0;

    console.log('Getting default refresh time...');
    userRefreshTime = Number(refreshTime) * timeMultiplier;

    return userRefreshTime;
  }
}
