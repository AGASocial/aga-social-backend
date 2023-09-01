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
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';


@Controller('authorization')
@ApiTags('authorization')
export class AuthorizationController {
    constructor(private readonly authorizationService: AuthorizationService){}



    @ApiOperation({ summary: 'Set a role to a user' })
    @ApiOkResponse({ description: 'Role set successfully ' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or user not found' })
    @Put('users/roles')
    async setRoleToUser(
        @Query('id') id: string,
        @Query('roleName') roleName: string,
        @Req() req: Request
    ): Promise<SetRoleToUserResponseDto> {
        return await this.authorizationService.setRoleToUser(id, roleName);
    }





    @ApiOperation({ summary: 'Delete a role from a user' })
    @ApiOkResponse({ description: 'Role deleted successfully' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or user not found' })
    @Delete('users/roles')
    async deleteRoleFromUser(
        @Query('id') id: string,
        @Query('roleName') roleName: string,
        @Req() req: Request
    ): Promise<DeleteRoleOfUserResponseDto> {
        return await this.authorizationService.deleteRoleOfUser(id, roleName);
    }








    @ApiOperation({ summary: 'Create a role' })
    @ApiOkResponse({ description: 'Role created successfully ' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @Post('roles')
    async createNewRole(@Body() createNewRoleDto: CreateNewRoleDto, @Req() req: Request){

        return await this.authorizationService.createNewRole(createNewRoleDto);
    }



    @ApiOperation({ summary: 'Update a role' })
    @ApiOkResponse({ description: 'Role updated successfully' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or role not found' })
    @Put('roles')
    async updateRole(
        @Query('name') roleName: string,
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


    

    @ApiOperation({ summary: 'Get roles' })
    @ApiOkResponse({ description: 'Roles retrieved successfully ' })
    @ApiBadRequestResponse({ description: 'Bad Request: Roles not found' })
    @Get('roles')
    async getRoles(@Req() req: Request): Promise<GetRolesResponseDto> {

        return this.authorizationService.getAllRoles();
    }


}
