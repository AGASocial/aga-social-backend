import { Ability, AbilityBuilder, InferSubjects, MongoAbility, createMongoAbility } from "@casl/ability";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Action } from "src/authorization/entities/action.enum";
import { Policy } from "src/roles/entities/policy.entity";
import { Allowance } from "src/authorization/entities/allowance.enum";
import { UsersService } from "src/users/users.service";
import { RolesService } from "src/roles/roles.service";

export type Subjects = InferSubjects<'User' | 'Role'> | 'all';  //Agregar otras entidades luego

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {

    constructor(private usersService: UsersService, private rolesService: RolesService) { }

    async defineAbility(userId: string) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

        // Obtener el rol del usuario directamente de su entidad
        const userSnap = await this.usersService.getUserById(userId);
        const userRole = await this.usersService.getUserRole(userSnap);

        let roleSnap = await this.rolesService.getRole(userRole);
        let policies: Policy[] = roleSnap.get("policies");
        for (let policy of policies) {
            if ((policy.allowance.valueOf() == Allowance.CAN)) {
                if (typeof (policy.fields) !== 'undefined')
                    can(policy.action, policy.subject, policy.fields)
                else
                    can(policy.action, policy.subject);
            } else if ((policy.allowance.valueOf() == Allowance.CANNOT)) {
                if (typeof (policy.fields) !== 'undefined')
                    cannot(policy.action, policy.subject, policy.fields)
                else
                    cannot(policy.action, policy.subject);
            } else {
                throw new BadRequestException('INVALIDPOLICYINROLE');
            }
        }

        return build();
    }
}
