import { SetMetadata } from "@nestjs/common";
import { Subjects } from "src/ability/factory/ability.factory";
import { Action } from "./entities/action.enum";


//Implements authorization policies based in roles
export abstract class RequiredPolicy {
    action: Action ;
    subject: Subjects;
    fields: string[];

    constructor (fields?: string[]) {
        if (typeof(fields) !== 'undefined')
            this.fields = fields;
    }
}


export class ManageUser extends RequiredPolicy {
    action: Action = Action.MANAGE;
    subject: Subjects = "User"

    
}
export class CreateUser extends RequiredPolicy {
    action: Action = Action.CREATE
    subject: Subjects = "User";
}
export class DeleteUser extends RequiredPolicy {
    action: Action = Action.DELETE;
    subject: Subjects = "User";
}
export class ReadUser extends RequiredPolicy {
    action: Action = Action.READ;
    subject: Subjects = "User";
}
export class UpdateUser extends RequiredPolicy {
    action: Action = Action.UPDATE;
    subject: Subjects = "User";
}

export class ManageRole extends RequiredPolicy {
    action: Action = Action.MANAGE;
    subject: Subjects = "Role"
}
export class CreateRole extends RequiredPolicy {
    action: Action = Action.CREATE
    subject: Subjects = "Role";
}
export class DeleteRole extends RequiredPolicy {
    action: Action = Action.DELETE;
    subject: Subjects = "Role";
}
export class ReadRole extends RequiredPolicy {
    action: Action = Action.READ;
    subject: Subjects = "Role";
}
export class UpdateRole extends RequiredPolicy {
    action: Action = Action.UPDATE;
    subject: Subjects = "Role";
}







export const CheckPolicies = (...requirements: RequiredPolicy[]) => SetMetadata('checkPolicy', requirements);