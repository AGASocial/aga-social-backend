import { BadRequestException, Injectable } from '@nestjs/common';
import { getDoc, doc, QueryFieldFilterConstraint, getDocs, limit, query, where, orderBy } from 'firebase/firestore';
import { GetRolesDto } from './dto/getRoles.dto';
import { DocResult } from 'src/utils/docResult.entity';
import { GetRolesResponseDto } from './dto/getRolesResponse.dto';
import { Role } from './entities/role.entity';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../firebase/firebase.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
@Injectable()
export class RolesService {

    constructor(private firebaseService: FirebaseService){}



    @ApiOperation({ summary: 'Get role by UUID' })
    @ApiOkResponse({ description: 'Role Gotten'})
    @ApiBadRequestResponse({ description: 'Role does not exist' })
    async getRoleById(uuid: string){
        const roleReference = await doc(this.firebaseService.rolesCollection, uuid);
        const roleSnap = await getDoc(roleReference);

        if (!roleSnap.exists()){
            throw new BadRequestException('ROLEDOESNOTEXIST'); 
        }

        return roleSnap;
    }



    @ApiOperation({ summary: 'Get role by name' })
    @ApiOkResponse({ description: 'Role Gotten' })
    async getRole(roleName: string) {
        console.log('Fetching role with name:', roleName);

        const rolesRef = this.firebaseService.rolesCollection;

        const customRolenameWhere: QueryFieldFilterConstraint = where("name", "==", roleName);
        const roleQuery = query(rolesRef, customRolenameWhere, limit(1));
        const roleQuerySnapshot = await getDocs(roleQuery);

        if (roleQuerySnapshot.empty) {
            console.log('Role not found.');
            return null;
        } else {
            const docSnapshot = roleQuerySnapshot.docs[0];
            const roleId = docSnapshot.id;
            console.log('Role found with ID:', roleId);
            return this.getRoleById(roleId);
        }
    }


   
}
   

