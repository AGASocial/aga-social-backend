import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DocumentReference, DocumentSnapshot, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, collection, where, deleteDoc, addDoc } from 'firebase/firestore';
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




   
    async getUserById(getUserByIdDto: GetUserByIdDto) {
        const userId: string = getUserByIdDto.user;
        return await this.usersService.getUserById(userId);
    }



    async setRoleToUser(userId: string, roleId: string): Promise<SetRoleToUserResponseDto> {
        try {

            const usersRef = collection(this.firebaseService.fireStore, 'users');
            const querySnapshot = await getDocs(query(usersRef, where('id', '==', userId)));

            if (querySnapshot.empty) {
                console.log(`User with the following id not found: ${userId}`);
                const response: SetRoleToUserResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'User not found.',
                    data: { result: {} },
                };
                return response;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            const currentRoles: Role[] = userData.role || [];

            const rolesCollectionRef = collection(this.firebaseService.fireStore, 'roles');
            const roleQuerySnapshot = await getDocs(query(rolesCollectionRef, where('id', '==', roleId)));

            if (roleQuerySnapshot.empty) {
                console.log(`Role with name "${roleId}" not found in the roles collection.`);
                const response: SetRoleToUserResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Role not found.',
                    data: { result: {} },
                };
                return response;
            }

            const roleDoc = roleQuerySnapshot.docs[0];
            const roleData = roleDoc.data();

            const newRole = {
                id: roleData.id
              
            };

            const updatedRoles = [...currentRoles, newRole];

            await updateDoc(userDoc.ref, { role: updatedRoles });

            const response: SetRoleToUserResponseDto = {
                status: 'success',
                code: 200,
                message: 'Role set successfully.',
                data: { result: { updatedRoles } },
            };

            console.log(`Updated User Roles`, updatedRoles);

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
            const response: SetRoleToUserResponseDto = {
                status: 'error',
                code: 400,
                message: 'The request could not be proccessed.',
                data: { result: {} },
            };
            throw response;
        }
    }






    async deleteRoleOfUser(userId: string, roleId: string): Promise<SetRoleToUserResponseDto> {
        try {
            const usersRef = collection(this.firebaseService.fireStore, 'users');
            const querySnapshot = await getDocs(query(usersRef, where('id', '==', userId)));

            if (querySnapshot.empty) {
                console.log(`User with the following id not found: ${userId}`);
                return {
                    status: 'error',
                    code: 404,
                    message: 'User not found.',
                    data: { result: {} },
                };
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            const currentRoles: Role[] = userData.role || [];

            const updatedRoles = currentRoles.filter((role) => role.id !== roleId);

            await updateDoc(userDoc.ref, { role: updatedRoles });

            console.log(`Updated User Roles`, updatedRoles);

            return {
                status: 'success',
                code: 200,
                message: 'Role deleted from user successfully.',
                data: { result: { updatedRoles } },
            };
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            return {
                status: 'error',
                code: 400,
                message: 'The request could not be processed.',
                data: { result: {} },
            };
        }
    }





    async createNewRole(createNewRoleDto: CreateNewRoleDto): Promise<CreateNewRoleResponseDto> {
        const roleName = createNewRoleDto.name;
        const roleDescription = createNewRoleDto.description;
        const roleDefault = createNewRoleDto.default;
        const roleActive = createNewRoleDto.active;

        try {
            console.log('Creating new role...');
            const newRole = {
                id: '',
                name: roleName,
                description: roleDescription,
                default: roleDefault,
                active: roleActive,
            };

            console.log('Saving new role to the database...');
            const docReference: DocumentReference = await addDoc(this.firebaseService.rolesCollection, newRole);
            const newRoleId: string = docReference.id;

            newRole.id = newRoleId;

            await updateDoc(doc(this.firebaseService.rolesCollection, newRoleId), newRole);

            console.log('New role saved successfully!');

            const cachedRoles = await this.firebaseService.getCollectionData('roles');
            const cachedRole = { id: newRoleId, ...newRole };
            cachedRoles.push(cachedRole);
            await this.firebaseService.setCollectionData('roles', cachedRoles);

            const createNewRoleDtoResponse: CreateNewRoleResponseDto = {
                status: 'success',
                code: 201,
                message: 'The role was created successfully.',
                data: { result: { roleId: newRoleId } },
            };
            console.log('Role creation complete.');
            return createNewRoleDtoResponse;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            const response: CreateNewRoleResponseDto = {
                status: 'error',
                code: 400,
                message: 'The request could not be processed.',
                data: { result: { roleId: '' } },
            };
            return response;
        }
    }




   
    async updateRole(roleId: string, newData: Partial<UpdateRoleDto>): Promise<UpdateRoleResponseDto> {
        try {
            console.log('Initializing updateRole...');
            const roleCollectionRef = admin.firestore().collection('roles');

            const querySnapshot = await roleCollectionRef.where('id', '==', roleId).get();

            if (querySnapshot.empty) {
                console.log(`The role "${roleId}" does not exist.`);
                const response: UpdateRoleResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'Role not found.',
                    data: { result: {} },
                };
                return response;
            }

            const errors = await validate(newData);

            if (errors.length > 0) {
                const response: UpdateRoleResponseDto = {
                    status: 'error',
                    code: 400,
                    message: 'Bad request. check the given parameters.',
                    data: { result: {} },
                };
                return response;
            }

            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, newData);
            });

            await batch.commit();
            console.log(`Updated info for role "${roleId}"`);

            const response: UpdateRoleResponseDto = {
                status: 'success',
                code: 200,
                message: 'Role updated successfully.',
                data: {
                    result: {}
                },
            };

            const cachedRoles = await this.firebaseService.getCollectionData('roles');
            const updatedCachedRoles = cachedRoles.map((role) => {
                if (role.id === roleId) {
                    return { ...role, ...newData };
                }
                return role;
            });
            await this.firebaseService.setCollectionData('roles', updatedCachedRoles);

            return response;
        } catch (error) {
            console.error('There was an error updating the role data:', error);
            const response: UpdateRoleResponseDto = {
                status: 'error',
                code: 400,
                message: 'The request could not be processed.',
                data: { result: {} },
            };
            return response;
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
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    active: data.active,
                    default: data.default,
                });
            });

            if (queryResult.length === 0) {
                console.log('No roles found.');
                const noRolesResponse: GetRolesResponseDto = {
                    status: 'error',
                    code: 404,
                    message: 'No roles found.',
                    data: { result: [] },
                };
                return noRolesResponse;
            }

            console.log('Roles data collected.');

            const getRolesDtoResponse: GetRolesResponseDto = {
                status: 'success',
                code: 200,
                message: 'Roles retrieved successfully.',
                data: { result: queryResult },
            };
            console.log('Response created.');

            return getRolesDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            const response: GetRolesResponseDto = {
                status: 'error',
                code: 400,
                message: 'There was an error retrieving the roles',
                data: { result: {} },
            };
            return response;
        }
    }



    async getRoleInformationById(roleId: string): Promise<GetRolesResponseDto> {
        try {
            console.log(`Initializing getRoleById for role ID: ${roleId}`);
            const rolesRef = this.firebaseService.rolesCollection;
            const roleQuery = query(rolesRef, where('id', '==', roleId));
            console.log('Role query created.');

            const roleQuerySnapshot = await getDocs(roleQuery);
            console.log('Role query snapshot obtained.');

            if (roleQuerySnapshot.empty) {
                console.log(`Role with ID "${roleId}" not found.`);
                const notFoundResponse: GetRolesResponseDto = {
                    status: 'error',
                    code: 404,
                    message: `Role with ID "${roleId}" not found.`,
                    data: { result: {} },
                };
                return notFoundResponse;
            }

            const roleData = roleQuerySnapshot.docs[0].data();

            const getRoleByIdDtoResponse: GetRolesResponseDto = {
                status: 'success',
                code: 200,
                message: 'Role retrieved successfully.',
                data: {
                    result: {
                        id: roleData.id,
                        name: roleData.name,
                        description: roleData.description,
                        active: roleData.active,
                        default: roleData.default,
                    },
                },
            };
            console.log('Response created.');

            return getRoleByIdDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            const response: GetRolesResponseDto = {
                status: 'error',
                code: 400,
                message: 'There was an error retrieving the role',
                data: { result: {} },
            };
            return response;
        }
    }





   
}
