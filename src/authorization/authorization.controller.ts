import { Controller, Body, Put, Req, UseGuards, Delete, Post, Get, Param, BadRequestException, Patch, Query, UseInterceptors } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { SetRoleToUserDto } from './dto/setRoleToUser.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { DeleteRoleOfUserDto } from './dto/deleteRoleOfUser.dto';
import { CreateNewRoleDto } from './dto/createNewRole.dto';

import { SetRoleStatusDto } from './dto/setRoleStatus.dto';
import { Status } from './entities/status.enum';
import { GetRolesDto } from '../roles/dto/getRoles.dto';
import { SetRoleToUserResponseDto } from './dto/setRoleToUserResponse.dto';
import { DeleteRoleOfUserResponseDto } from './dto/deleteRoleOfUserResponse.dto';
import { GetRoleByIdDto } from 'src/roles/dto/getRoleById.dto';
import { GetRoleByIdResponseDto } from 'src/roles/dto/getRoleByIdResponse.dto';
import { GetRolesResponseDto } from 'src/roles/dto/getRolesResponse.dto';
import { UpdateRoleDto } from './dto/updateRole.dto';
import { DataControlInterceptor } from './interceptor/dataControl.interceptor';


@Controller('authorization')
export class AuthorizationController {
    constructor(private readonly authorizationService: AuthorizationService){}

    @UseGuards(JwtAuthGuard)
    @Put('firebase/users/:userId/roles/:roleId')
    async setRoleToUser(@Param('userId') userId: string, @Param('roleId') roleId: string, @Req() req: Request): Promise<SetRoleToUserResponseDto> {

        const setRoleToUserDto: SetRoleToUserDto = {user: userId, role: roleId};

        return await this.authorizationService.setRoleToUser(setRoleToUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('firebase/users/:userId/roles/:roleId')
    async deleteRoleOfUser(@Param('userId') userId: string, @Param('roleId') roleId: string, @Req() req: Request): Promise<DeleteRoleOfUserResponseDto> {
        const deleteRoleOfUserDto: DeleteRoleOfUserDto = {user: userId, role: roleId};

        return await this.authorizationService.deleteRoleOfUser(deleteRoleOfUserDto);
    }



    

    @UseGuards(JwtAuthGuard)
    @Post('firebase/roles')
    async createNewRole(@Body() createNewRoleDto: CreateNewRoleDto, @Req() req: Request){

        return await this.authorizationService.createNewRole(createNewRoleDto);
    }

    @UseInterceptors(DataControlInterceptor)
    @UseGuards(JwtAuthGuard)
    @Put('firebase/roles/:roleId')
    async updateRole(@Param('roleId') roleId: string, @Body() updateRoleDto: UpdateRoleDto, @Req() req: Request) {
        updateRoleDto.role = roleId;

        return await this.authorizationService.updateRole(updateRoleDto);
    }

    

    @UseGuards(JwtAuthGuard)
    @Patch('firebase/roles/:roleId/status')
    async setRoleStatus(@Param('roleId') role: string, @Body() setRoleStatusDto: SetRoleStatusDto, @Req() req: Request){

        setRoleStatusDto.role = role;
        if (setRoleStatusDto.status == Status.ENABLE)
            return await this.authorizationService.enableRole(setRoleStatusDto);
        else if(setRoleStatusDto.status == Status.DISABLE)
            return await this.authorizationService.disableRole(setRoleStatusDto);
        else {
            throw new BadRequestException('INVALIDSTATUS');
        }
    }


    @UseGuards(JwtAuthGuard)
    @Get('firebase/roles/:uuid')
    async getRoleById(@Param('uuid') uuid: string, @Req() req: Request): Promise<GetRoleByIdResponseDto>{

        let getRoleByIdDto: GetRoleByIdDto = {role: uuid}
        let roleSnap = await this.authorizationService.getRoleById(getRoleByIdDto); 
        let roleData = roleSnap.data();
        const getRoleByIdDtoResponse: GetRoleByIdResponseDto = {statusCode: 200, message: "ROLEGOTEN", data: roleData};
        return getRoleByIdDtoResponse;
    }

  /*  @UseGuards(JwtAuthGuard)
    @Get('firebase/roles')
    async getRoles(@Query('limit') limit: string, @Req() req: Request): Promise<GetRolesResponseDto>{
        let getRolesDto: GetRolesDto = {limit: Number(limit)};

        return this.authorizationService.getRoles(getRolesDto);
    }*/

  

   

}
