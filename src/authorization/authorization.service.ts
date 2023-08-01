import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { SetRoleToUserDto } from './dto/setRoleToUser.dto';
import { DocumentReference, DocumentSnapshot, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { SetRoleToUserResponseDto } from './dto/setRoleToUserResponse.dto';
import { DeleteRoleOfUserDto } from './dto/deleteRoleOfUser.dto';
import { CreateNewRoleDto } from './dto/createNewRole.dto';
import {v4 as uuidv4} from 'uuid';
import { Role } from '../roles/entities/role.entity';
import { CreateNewRoleResponseDto } from './dto/createNewRoleResponse.dto';
import { DeleteRoleOfUserResponseDto } from './dto/deleteRoleOfUserResponse.dto';
import { SetRoleStatusDto } from './dto/setRoleStatus.dto';
import { SetRoleStatusResponseDto } from './dto/setRoleStatusResponse.dto';
import { Policy } from '../roles/entities/policy.entity';
import { GetRolesDto } from '../roles/dto/getRoles.dto';
import { UsersService } from 'src/users/users.service';
import { RolesService } from 'src/roles/roles.service';
import { Rule } from 'src/roles/entities/rule.entity';
import { UpdateRoleDto } from './dto/updateRole.dto';
import { UpdateRoleResponseDto } from './dto/updateRoleResponse.dto';
import { GetUserByIdDto } from 'src/users/dto/getUserById.dto';
import { GetRoleByIdDto } from 'src/roles/dto/getRoleById.dto';




@Injectable()
export class AuthorizationService {
    constructor(private firebaseService: FirebaseService, private usersService: UsersService, private rolesService: RolesService){}

    async getUserById(getUserByIdDto: GetUserByIdDto) {
        const userId: string = getUserByIdDto.user;
        return await this.usersService.getUserById(userId);
    }

    async setRoleToUser(setRoleToUserDto: SetRoleToUserDto): Promise<SetRoleToUserResponseDto> {
        const {user, role} = setRoleToUserDto;

        const userSnap = await this.usersService.getUserById(user);
        const roleSnap = await this.rolesService.getRoleById(role);
        const roleId: string = roleSnap.id;
        let userRoles = userSnap.get("roles");

        if (userRoles.includes(roleId)){
            throw new BadRequestException('USERALREADYHASROLE');
        }
        else{
            userRoles.push(roleId);
            try {
                const userReference = doc(this.firebaseService.usersCollection, user);
                await updateDoc(userReference, {roles: userRoles}); 
                const setRoleToUserDtoResponse: SetRoleToUserResponseDto = {statusCode: 200, message: "ROLESETTOUSER"};
                return setRoleToUserDtoResponse;
            } catch (error: unknown) {
                console.warn(`[Error]: ${error}`);
            }
        }
    }

    async deleteRoleOfUser(deleteRoleOfUserDto: DeleteRoleOfUserDto): Promise<DeleteRoleOfUserResponseDto> {
        const {user, role} = deleteRoleOfUserDto;

        const userSnap = await this.usersService.getUserById(user);
        const roleSnap = await this.rolesService.getRoleById(role);
        const roleId: string = roleSnap.id;
        let userRoles = userSnap.get("roles");

        if (!(userRoles.includes(roleId))){
            throw new BadRequestException('USERHASNOTROLE');
        }
        else{
            const userRoleIndex: number = userRoles.indexOf(roleId);
            userRoles.splice(userRoleIndex,1);
            try {
                const userReference = doc(this.firebaseService.usersCollection, user);
                await updateDoc(userReference, {roles: userRoles}); 
                const deleteRoleOfUserDtoResponse: DeleteRoleOfUserResponseDto = {statusCode: 200, message: "ROLEREVOKED"};
                return deleteRoleOfUserDtoResponse;
            } catch (error: unknown) {
                console.warn(`[Error]: ${error}`);
            }
        }
        
    }

   
   

    
    async createNewRole(createNewRoleDto: CreateNewRoleDto): Promise<CreateNewRoleResponseDto>{
        const roleName = createNewRoleDto.role_name;
        const rolePolicies: Policy[] = createNewRoleDto.policies;
        const roleRules: Rule[] = createNewRoleDto.rules;
    
        if(await this.rolesService.getRole(roleName) != null){
            throw new BadRequestException('ROLEALREADYEXISTS');
        }
        else{
            const id: string = uuidv4();
            const role: Role = {role_name:roleName, policies: rolePolicies, rules: roleRules, stages: createNewRoleDto.stages, session_time: String(createNewRoleDto.session_time), refresh_time: String(createNewRoleDto.refresh_time), status: "disabled"};
            try {
                let docReference: DocumentReference = doc(this.firebaseService.rolesCollection, id);
                await setDoc(docReference, role);
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
            }
        }

        const createNewRoleDtoResponse: CreateNewRoleResponseDto = {statusCode: 201, message: 'ROLECREATED'};
        return createNewRoleDtoResponse;
    }

    async updateRole(updateRoleDto: UpdateRoleDto): Promise<UpdateRoleResponseDto> {
        const {role} = updateRoleDto;
        await this.rolesService.getRoleById(role);
        
        try {
            const roleReference = doc(this.firebaseService.rolesCollection,role);
            for (let [key, value] of Object.entries(updateRoleDto)) {
                if((key != "role") && (value != undefined)){
                    if(key == 'role_name'){
                        updateDoc(roleReference, { role_name: value});
                    }
                    else if (key == 'policies'){
                        let newPolicies: Policy[] = updateRoleDto.policies;
                        updateDoc(roleReference, { policies: newPolicies});
                    }
                    else if (key == 'rules'){
                        let newRules: Rule[] = updateRoleDto.rules;
                        updateDoc(roleReference, { rules: newRules});
                    }
                    else if (key == 'stages'){
                        updateDoc(roleReference, { stages: value});
                    }
                    else if (key == 'session_time'){
                        updateDoc(roleReference, { session_time: value});
                    }
                    else if (key == 'refresh_time'){
                        updateDoc(roleReference, { refresh_time: value});
                    }
                }
            }
            const updateRoleResponseDto: UpdateRoleResponseDto = {statusCode: 200, message: "ROLEUPDATED"};
            return updateRoleResponseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }
    }

    async enableRole(enableRoleDto: SetRoleStatusDto): Promise<SetRoleStatusResponseDto>{
        const {role} = enableRoleDto;
        await this.rolesService.getRoleById(role);

        try {
            const roleReference = doc(this.firebaseService.rolesCollection,role);
            updateDoc(roleReference, {status: "enabled"});
            const enableRoleResponseDto: SetRoleStatusResponseDto = {statusCode: 200, message: "ROLEENABLED"};
            return enableRoleResponseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }
    }

    async disableRole(disableRoleDto: SetRoleStatusDto): Promise<SetRoleStatusResponseDto>{
        const {role} = disableRoleDto;
        await this.rolesService.getRoleById(role);

        try {
            const roleReference = doc(this.firebaseService.rolesCollection,role);
            updateDoc(roleReference, {status: "disabled"});
            const disableRoleResponseDto: SetRoleStatusResponseDto = {statusCode: 200, message: "ROLEEDISABLED"};
            return disableRoleResponseDto;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
        }
    }

    

   

    async getAdmin(jwtToken: string){
        const adminId = this.usersService.extractID(jwtToken)
        const adminReference = doc(this.firebaseService.usersCollection, adminId)
        const adminSnap = await getDoc(adminReference);

        return adminSnap;
    }
    
    async getRoleById(getRoleByIdDto: GetRoleByIdDto){

        let uuid: string = getRoleByIdDto.role;

        return await this.rolesService.getRoleById(uuid);
    } 



    async getRoles(getRolesDto: GetRolesDto){
        
        return await this.rolesService.getRoles(getRolesDto);
    } 

  
    async getUserRules(userSnap: DocumentSnapshot): Promise<Rule[]> {
        let userRoles = await this.usersService.getUserRole(userSnap)
        let userRules: Rule[] = [];
        for (let role of userRoles) {
            let roleSnap = await this.rolesService.getRole(role);
            let roleRules = roleSnap.get("rules");
            if (typeof (roleRules) != 'undefined') {
                let roleRulesHandler: Rule[] = roleRules;
                userRules = userRules.concat(roleRulesHandler);
            }
            else {
                roleRules = [];
            }
        }
        return userRules;
    }
   
}
