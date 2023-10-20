import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DocumentReference, DocumentSnapshot, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, collection, where, deleteDoc } from 'firebase/firestore';
import { SetRoleToUserResponseDto } from './dto/setRoleToUserResponse.dto';
import { CreateNewRoleDto } from './dto/createNewRole.dto';
import {v4 as uuidv4} from 'uuid';
import { Role } from '../roles/entities/role.entity';
import { CreateNewRoleResponseDto } from './dto/createNewRoleResponse.dto';
import { GetRolesDto } from '../roles/dto/getRoles.dto';
import { UpdateRoleDto } from './dto/updateRole.dto';
import { UpdateRoleResponseDto } from './dto/updateRoleResponse.dto';
import * as admin from 'firebase-admin';
import { GetRolesResponseDto } from '../roles/dto/getRolesResponse.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { GetUserByIdDto } from '../users/dto/getUserById.dto';
import { GetRoleByIdDto } from '../roles/dto/getRoleById.dto';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { validate } from 'class-validator';



@Injectable()
export class AuthorizationService {
    constructor(private firebaseService: FirebaseService, private usersService: UsersService, private rolesService: RolesService){}




    @ApiOperation({ summary: 'Get user by id' })
    @ApiOkResponse({ description: 'user retrieved successfully'})
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getUserById(getUserByIdDto: GetUserByIdDto) {
        const userId: string = getUserByIdDto.user;
        return await this.usersService.getUserById(userId);
    }



    @ApiOkResponse({ description: 'Role set to user successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async setRoleToUser(userId: string, roleName: string): Promise<SetRoleToUserResponseDto> {
        try {

            console.log(userId)
            console.log(roleName)

            const usersRef = collection(this.firebaseService.fireStore, 'users');
            const querySnapshot = await getDocs(query(usersRef, where('id', '==', userId)));
            if (querySnapshot.empty) {
                console.log(`User with the following id not found: ${userId}`);
                const response: SetRoleToUserResponseDto = {
                    statusCode: 400, 
                    message: 'USERNOTFOUND',
                };
                return response;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            const currentRoles: Role[] = userData.role || [];

            const rolesCollectionRef = collection(this.firebaseService.fireStore, 'roles');
            const roleQuerySnapshot = await getDocs(query(rolesCollectionRef, where('name', '==', roleName)));

            if (roleQuerySnapshot.empty) {
                console.log(`Role with name "${roleName}" not found in the roles collection.`);
                const response: SetRoleToUserResponseDto = {
                    statusCode: 400, 
                    message: 'ROLENOTFOUND',
                };
                return response;
            } 


            const roleDoc = roleQuerySnapshot.docs[0];
            const roleData = roleDoc.data();

            const newRole: Role = {
                name: roleData.name,
                description: roleData.description,
                default: roleData.default,
                active: roleData.active,
            };


            const updatedRoles = [...currentRoles, newRole];

            await updateDoc(userDoc.ref, { role: updatedRoles });

            const response: SetRoleToUserResponseDto = {
                statusCode: 200,
                message: 'ROLESSETSUCCESS',
            };


            console.log(`Updated User Roles`, updatedRoles);

            // Update cache with the newly modified user data
            const cachedUsers = await this.firebaseService.getCollectionData('users');
            const updatedCachedUsers = cachedUsers.map((user) => {
                if (user.id === userId) {
                    return { ...user, role: updatedRoles };
                }
                return user;
            });

            await this.firebaseService.setCollectionData('users', updatedCachedUsers);

            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }










    @ApiOperation({ summary: 'Delete role of user' })
    @ApiOkResponse({ description: 'Role deleted from user successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async deleteRoleOfUser(userId: string, roleName: string): Promise<SetRoleToUserResponseDto> {
        try {
            const usersRef = collection(this.firebaseService.fireStore, 'users');
            const querySnapshot = await getDocs(query(usersRef, where('id', '==', userId)));

            if (querySnapshot.empty) {
                console.log(`User with the following id not found: ${userId}`);
                const response: SetRoleToUserResponseDto = {
                    statusCode: 400, 
                    message: 'USERNOTFOUND',
                };
                return response;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            const currentRoles: Role[] = userData.role || [];

            const roleIndex = currentRoles.findIndex((role) => role.name === roleName);

            if (roleIndex === -1) {
                console.log(`Role with name "${roleName}" not found in the user's roles.`);
                const response: SetRoleToUserResponseDto = {
                    statusCode: 400, 
                    message: 'ROLENOTFOUND',
                };
                return response;
            }

            currentRoles.splice(roleIndex, 1);

            await updateDoc(userDoc.ref, { role: currentRoles });

            const response: SetRoleToUserResponseDto = {
                statusCode: 200,
                message: 'ROLEDELETEDSUCCESS',
            };

            console.log(`Updated User Roles`, currentRoles);

            // Update cache with the newly modified user data
            const cachedUsers = await this.firebaseService.getCollectionData('users');
            const updatedCachedUsers = cachedUsers.map((user) => {
                if (user.id === userId) {
                    return { ...user, role: currentRoles };
                }
                return user;
            });

            await this.firebaseService.setCollectionData('users', updatedCachedUsers);

            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }










   

    @ApiOperation({ summary: 'Create role firebase' })
    @ApiOkResponse({ description: 'Role created successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async createNewRole(createNewRoleDto: CreateNewRoleDto): Promise<CreateNewRoleResponseDto> {
        const roleName = createNewRoleDto.name;
        const roleDescription = createNewRoleDto.description;
        const roleDefault = createNewRoleDto.default;
        const roleActive = createNewRoleDto.active;
        const newRoleId: string = uuidv4();

        console.log('Creating new role...');

        if (await this.rolesService.getRole(roleName) != null) {
            const response: CreateNewRoleResponseDto = {
                statusCode: 400,
                message: 'ROLEALREADYEXISTS',
                roleId: '',
            };
            return response;
        } else {
            const newRole = {
                id: newRoleId,
                name: roleName,
                description: roleDescription,
                default: roleDefault,
                active: roleActive,
            };
            try {
                console.log('Saving new role to the database...');
                let docReference: DocumentReference = doc(this.firebaseService.rolesCollection, newRole.id);
                await setDoc(docReference, newRole);
                console.log('New role saved successfully!');

                const cachedRoles = await this.firebaseService.getCollectionData('roles');
                cachedRoles.push(newRole);
                await this.firebaseService.setCollectionData('roles', cachedRoles);
            } catch (error: unknown) {
                console.warn(`[ERROR]: ${error}`);
                const response: CreateNewRoleResponseDto = {
                    statusCode: 400,
                    message: 'UNABLETOCREATEROLE',
                    roleId: '',
                };
                return response;
            }
        }

        const createNewRoleDtoResponse: CreateNewRoleResponseDto = { statusCode: 201, message: 'ROLECREATED', roleId: newRoleId };
        console.log('Role creation complete.');
        return createNewRoleDtoResponse;
    }




    @ApiOperation({ summary: 'Update role from firebase' })
    @ApiOkResponse({ description: 'Role updated successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    async updateRole(roleName: string, newData: Partial<UpdateRoleDto>): Promise<UpdateRoleResponseDto> {
        try {
            console.log('Initializing updateRole...');
            const roleCollectionRef = admin.firestore().collection('roles');

            const querySnapshot = await roleCollectionRef.where('name', '==', roleName).get();

            if (querySnapshot.empty) {
                console.log(`The role "${roleName}" does not exist.`);
                const response: UpdateRoleResponseDto = {
                    statusCode: 400, 
                    message: 'ROLEDOESNOTEXIST',
                };
                return response;
            }

            const errors = await validate(newData);

            if (errors.length > 0) {
                const response: UpdateRoleResponseDto = {
                    statusCode: 400,
                    message: 'INVALIDINPUT',
                };
                return response;
            }



            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, newData);
            });

            await batch.commit();
            console.log(`Updated info for role "${roleName}"`);

            const response: UpdateRoleResponseDto = {
                statusCode: 200,
                message: 'ROLEUPDATED',
            };

            const cachedRoles = await this.firebaseService.getCollectionData('roles');
            const updatedCachedRoles = cachedRoles.map((role) => {
                if (role.name === roleName) {
                    return { ...role, ...newData };
                }
                return role;
            });
            await this.firebaseService.setCollectionData('roles', updatedCachedRoles);

            return response;
        } catch (error) {
            console.error('There was an error updating the role data:', error);
            throw error;
        }
    }



   


   
    async getAdmin(jwtToken: string){
        const adminId = this.usersService.extractID(jwtToken)
        const adminReference = doc(this.firebaseService.usersCollection, adminId)
        const adminSnap = await getDoc(adminReference);

        return adminSnap;
    }




    @ApiOperation({ summary: 'get role by id from firebase' })
    @ApiOkResponse({ description: 'role retrieved successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getRoleById(getRoleByIdDto: GetRoleByIdDto){

        let uuid: string = getRoleByIdDto.role;

        return await this.rolesService.getRoleById(uuid);
    } 


  
  

    @ApiOperation({ summary: 'Get roles from firebase' })
    @ApiOkResponse({ description: 'Roles retrieved successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getAllRoles(): Promise<GetRolesResponseDto> {
        try {
            console.log('Initializing getAllRoles...');
            const rolesRef = this.firebaseService.rolesCollection;
            const roleQuery = query(rolesRef, orderBy("name"));
            console.log('Role query created.');

            const roleQuerySnapshot = await getDocs(roleQuery);
            console.log('Role query snapshot obtained.');

            let queryResult = [];
            roleQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    name: data.name,
                    description: data.description,
                    active: data.active,
                    default: data.default,
                });
            });
            console.log('Roles data collected.');

            const getRolesDtoResponse: GetRolesResponseDto = {
                statusCode: 200,
                message: "ROLESGOT",
                rolesFound: queryResult,
            };
            console.log('Response created.');

            return getRolesDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('Error al obtener los roles.');
        }
    }



   
}
