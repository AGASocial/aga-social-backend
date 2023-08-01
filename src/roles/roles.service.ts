import { BadRequestException, Injectable } from '@nestjs/common';
import { getDoc, doc, QueryFieldFilterConstraint, getDocs, limit, query, where, orderBy } from 'firebase/firestore';
import { GetRolesDto } from './dto/getRoles.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import { DocResult } from 'src/utils/docResult.entity';
import { GetRolesResponseDto } from './dto/getRolesResponse.dto';
import { Rule } from './entities/rule.entity';

@Injectable()
export class RolesService {

    constructor(private firebaseService: FirebaseService){}

    async getRoleById(uuid: string){
        const roleReference = await doc(this.firebaseService.rolesCollection, uuid);
        const roleSnap = await getDoc(roleReference);

        if (!roleSnap.exists()){
            throw new BadRequestException('ROLEDOESNOTEXIST'); 
        }

        return roleSnap;
    }

    async getRole(roleName: string){
        const rolesRef = this.firebaseService.rolesCollection;

        const customRolenameWhere: QueryFieldFilterConstraint = where("role_name", "==", roleName);
        const roleQuery = query(rolesRef, customRolenameWhere,limit(1));
        const roleQuerySnapshot = await getDocs(roleQuery);

        if (roleQuerySnapshot.empty) {
            return null;
        }
        else{
            const docSnapshot = roleQuerySnapshot.docs[0];
            const roleId = docSnapshot.id;
            return this.getRoleById(roleId);
        }
    }

    async getRoles(getRolesDto: GetRolesDto): Promise<GetRolesResponseDto>{
        
        try{
            const rolesRef = this.firebaseService.rolesCollection;
            const roleQuery = query(rolesRef, orderBy("role_name"), limit(getRolesDto.limit));
            const roleQuerySnapshot = await getDocs(roleQuery);
            let queryResult : DocResult[] = [];
            roleQuerySnapshot.forEach((doc) => {
                queryResult.push({id: doc.id, name: doc.get("role_name")});
            })
            const getRolesDtoResponse: GetRolesResponseDto = {statusCode: 200, message: "ROLESGOT", rolesFound: queryResult};
            return getRolesDtoResponse;
        } catch(error: unknown){
            console.warn(`[ERROR]: ${error}`);
        }
    }

    async getRoleRules(roleName: string): Promise<Rule[]> {
        try {
            let roleSnap = await this.getRole(roleName);
            let roleRules: Rule[] = roleSnap.get("rules");
            return roleRules;
        } catch(error: unknown){
            console.warn(`[ERROR]: ${error}`);
        }
    }
}
