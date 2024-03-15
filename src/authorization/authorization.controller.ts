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
import { ApiBadRequestResponse, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from "express";
import { CreateNewRoleResponseDto } from './dto/createNewRoleResponse.dto';




@Controller()
export class AuthorizationController {
    constructor(private readonly authorizationService: AuthorizationService){}



    @ApiTags('Users')
    @ApiOperation({ summary: 'Set role to user' })
    @ApiOkResponse({ description: 'Role set to user successfully', type: SetRoleToUserResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Missing required parameters' })
    @ApiParam({ name: 'id', type: 'string', example: '0EwINikFVAg7jtRdkZYiTBXN4vW2' })
    @ApiParam({ name: 'roleId', type: 'string', example: 'besCEOpGZT2QZqORCN9p' })
    @Patch('users/:id/roles/:roleId')
    async setRoleToUser(
        @Res() res: Response,
        @Param('id') id: string,
        @Param('roleId') roleId: string,
    ): Promise<void> {
        try {     

            const response: SetRoleToUserResponseDto = await this.authorizationService.setRoleToUser(id, roleId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error setting role to user:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to set role to user',
                data: {},
            });
        }
    }



    @ApiTags('Users')
    @ApiOperation({ summary: 'Delete role from user' })
    @ApiOkResponse({ description: 'Role deleted from user successfully', type: DeleteRoleOfUserResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Missing required parameters' })
    @ApiParam({ name: 'id', type: 'string', example: '0EwINikFVAg7jtRdkZYiTBXN4vW2' })
    @ApiParam({ name: 'roleId', type: 'string', example: 'besCEOpGZT2QZqORCN9p' })
    @Delete('users/:id/roles/:roleId')
    async deleteRoleFromUser(
        @Res() res: Response,
        @Param('id') id: string,
        @Param('roleId') roleId: string,
    ): Promise<void> {
        try {
            const response: DeleteRoleOfUserResponseDto = await this.authorizationService.deleteRoleOfUser(id, roleId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error deleting role from user:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to delete role from user',
                data: {},
            });
        }
    }





    @ApiTags('Roles')
    @ApiOperation({ summary: 'Create a new role' })
    @ApiBody({ type: CreateNewRoleDto })
    @ApiOkResponse({ description: 'Role created successfully', type: CreateNewRoleResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @Post('roles')
    async createNewRole(
        @Res() res: Response,
        @Body() createNewRoleDto: CreateNewRoleDto,
    ): Promise<void> {
        try {
            const response: CreateNewRoleResponseDto = await this.authorizationService.createNewRole(createNewRoleDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error creating a new role:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to create a new role',
                data: {},
            });
        }
    }




    @ApiTags('Roles')
    @ApiOperation({ summary: 'Update role by ID' })
    @ApiBody({ type: UpdateRoleDto })
    @ApiOkResponse({ description: 'Role updated successfully', type: UpdateRoleResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiParam({ name: 'roleId', type: 'string', example: 'besCEOpGZT2QZqORCN9p' })
    @Patch('roles/:roleId')
    async updateRole(
        @Res() res: Response,
        @Param('roleId') roleId: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ): Promise<void> {
        try {
            const response: UpdateRoleResponseDto = await this.authorizationService.updateRole(roleId, updateRoleDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error updating the role:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to update the role',
                data: {},
            });
        }
    }



    
    @ApiTags('Roles')
    @ApiOperation({ summary: 'Get all roles' })
    @ApiOkResponse({ description: 'Roles retrieved successfully', type: GetRolesResponseDto })
    @Get('roles')
    async getRoles(@Res() res: Response): Promise<void> {
        try {
            const response: GetRolesResponseDto = await this.authorizationService.getAllRoles();

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error retrieving roles:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve roles',
                data: {},
            });
        }
    }



    @ApiTags('Roles')
    @ApiOperation({ summary: 'Get role information by ID' })
    @ApiOkResponse({ description: 'Role information retrieved successfully', type: GetRolesResponseDto })
    @ApiNotFoundResponse({ description: 'Role not found', type: GetRolesResponseDto })
    @ApiParam({ name: 'roleId', type: 'string', example: 'besCEOpGZT2QZqORCN9p' })
    @Get('roles/:roleId')
    async getRoleInformationById(@Res() res: Response, @Param('roleId') roleId: string): Promise<void> {
        try {
            const response: GetRolesResponseDto = await this.authorizationService.getRoleInformationById(roleId);

           
                res.status(response.code).send({
                    status: response.status,
                    code: response.code,
                    message: response.message,
                    data: response.data.result,
                });
            
        } catch (error) {
            console.error('Error retrieving role information:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve role information',
                data: {},
            });
        }
    }


}
