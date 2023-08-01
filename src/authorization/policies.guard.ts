import { AbilityFactory } from "src/ability/factory/ability.factory";
import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { doc, getDoc } from "firebase/firestore";
import { AuthService } from "src/auth/auth.service";
import { FirebaseService } from "src/firebase/firebase.service";
import { AuthorizationService } from "./authorization.service";
import { ForbiddenError } from "@casl/ability";
import { Policy } from "../roles/entities/policy.entity";
import { RequiredPolicy } from "./policies.decorator";
import { UsersService } from "src/users/users.service";

//Checks if the user has the right permits to access a route based on established policies
@Injectable()
export class PoliciesGuard implements CanActivate{
    constructor(private reflector: Reflector, private authService: AuthService, private firebaseService: FirebaseService, private abilityFactory: AbilityFactory, private usersService: UsersService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPolicies = 
        this.reflector.get<RequiredPolicy[]>('checkPolicy', context.getHandler()) || [];

        
        const req: Request = context.switchToHttp().getRequest();
        
        let policyMet: boolean = false;

        if (!requiredPolicies) {
            policyMet = true;
        }
       
        else {
            
            const jwtToken:string = req.signedCookies.bearer_token;
            const userId = this.usersService.extractID(jwtToken);
            let ability = await this.abilityFactory.defineAbility(userId);
            try{
                requiredPolicies.forEach((policy) => 
                    ForbiddenError.from(ability).throwUnlessCan(policy.action, policy.subject)
                );
                policyMet = true;
            } catch(error: unknown){
                console.warn(`[ERROR]: ${error}`);
            }
            
        }

        return policyMet;
    }   
}