import { Controller, Body, Put, Req, Delete, Post, Get, Param, BadRequestException, Patch, Query, UseInterceptors, Res } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { SetRoleToUserDto } from './dto/setRoleToUser.dto';
import { Request } from 'express';
import { DeleteRoleOfUserDto } from './dto/deleteRoleOfUser.dto';
import { CreateNewRoleDto } from './dto/createNewRole.dto';
import { GetRolesDto } from '../roles/dto/getRoles.dto';
import { SetRoleToUserResponseDto } from './dto/setRoleToUserResponse.dto';
import { DeleteRoleOfUserResponseDto } from './dto/deleteRoleOfUserResponse.dto';
import { GetRoleByIdDto } from 'src/roles/dto/getRoleById.dto';
import { GetRoleByIdResponseDto } from 'src/roles/dto/getRoleByIdResponse.dto';
import { GetRolesResponseDto } from 'src/roles/dto/getRolesResponse.dto';
import { UpdateRoleDto } from './dto/updateRole.dto';
import { UpdateRoleResponseDto } from './dto/updateRoleResponse.dto';


@Controller('authorization')
export class AuthorizationController {
    constructor(private readonly authorizationService: AuthorizationService){}

    @Put('firebase/users/:email/roles/:roleName')
    async setRoleToUser(@Param('email') email: string, @Param('roleName') roleName: string, @Req() req: Request): Promise<SetRoleToUserResponseDto> {


        return await this.authorizationService.setRoleToUser(email, roleName);
    }




    
    @Delete('firebase/users/:email/roles/:roleName')
    async deleteRoleOfUser(@Param('email') email: string, @Param('roleName') roleName: string, @Req() req: Request): Promise<DeleteRoleOfUserResponseDto> {

        return await this.authorizationService.deleteRoleOfUser(email, roleName);
    }



    @Delete('firebase/roles/:roleName')
    async deleteRoleFirebase(@Param('roleName') roleName: string): Promise<SetRoleToUserResponseDto> {
        return await this.authorizationService.deleteRoleFirebase(roleName);

    }
    

    @Post('firebase/roles')
    async createNewRole(@Body() createNewRoleDto: CreateNewRoleDto, @Req() req: Request){

        return await this.authorizationService.createNewRole(createNewRoleDto);
    }

    @Put('firebase/roles/:name') //:Subscriber, Publisher or Admin
    async updateRole(
        @Param('name') roleName: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ): Promise<UpdateRoleResponseDto> {
        try {
            updateRoleDto.name = roleName;
            const response = await this.authorizationService.updateRole(roleName, updateRoleDto);
            return response;
        } catch (error) {
            console.error('Error al actualizar los datos del rol:', error);
            throw error;
        }
    }

    

    
    @Get('firebase/roles')
    async getRoles(@Req() req: Request): Promise<GetRolesResponseDto> {

        return this.authorizationService.getAllRoles();
    }


}
