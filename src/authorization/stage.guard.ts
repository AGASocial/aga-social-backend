import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { stage } from "src/utils/constants";
import { UsersService } from "src/users/users.service";
import { RolesService } from "src/roles/roles.service";

//Controls the access of routes based on a stage
@Injectable()
export class StageGuard implements CanActivate {
    constructor(private usersService: UsersService, private rolesService: RolesService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        let stageMet: boolean = false;
        const requiredStage = stage;
        const req: Request = context.switchToHttp().getRequest();

        const jwtToken:string = req.signedCookies.bearer_token;
        const userId = this.usersService.extractID(jwtToken);
        const userSnap = await this.usersService.getUserById(userId);
        let userRoles = await this.usersService.getUserRole(userSnap);
        for (let role of userRoles){
            let roleSnap = await this.rolesService.getRole(role);
            let roleStages: string[] = roleSnap.get("stages");
            if(roleStages != undefined){
                if(roleStages.includes(requiredStage)){
                    stageMet = true;
                    break;
                }
            }
        }

        return stageMet;
    }
}