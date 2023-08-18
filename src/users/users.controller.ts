import { Controller, Get, Post, Put, UseGuards, Request, Req, BadRequestException, UnauthorizedException, HttpStatus, Body, Header, Query, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiOkResponse, ApiHeader, ApiHeaders } from '@nestjs/swagger';
import { userDTO } from 'src/users/dto/user.dto';
import * as admin from 'firebase-admin'
import { UsersService } from './users.service';
import { PassworduserDTO } from './dto/password.user.dto';
import { useremailDTO } from './dto/user.email.dto';
import { FindPluginPayDTO } from 'src/pluggin/dto/Find-plugin-pay.dto';
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {
    }

    @Post('login')
    async login(@Request() req, @Body() userDto: PassworduserDTO) {
        return this.userService.sign_in_with_email_and_password(userDto.email, userDto.password);
    }

    @Post()
    @ApiOkResponse({ schema: { example: { isAuthenticate: true, status: 200 } } })
    public async createUser(@Req() req: Request, @Body() userDto: userDTO): Promise<any> {
        return this.userService.create_user(userDto);
    }

    @Get()
    @UseGuards(AuthGuard('firebase-jwt'))
    @ApiBearerAuth()
    public async ListUsers(@Req() req: Request): Promise<any> {
        return this.userService.listusers();
    }
    @UseGuards(AuthGuard('firebase-jwt'))
    @ApiBearerAuth()
    @Get(':uid/plugins/')
    async FindOnePlugginPay(@Req() req: Request, @Param('uid') uid: string) {
        return await this.userService.findpluginPay(uid);
    }

    @Put('credentials')
    public async changepassword(@Req() req: Request, @Body() userDto: PassworduserDTO): Promise<any> {


        return this.userService.Changepassword(userDto);

    }


    @Post('/credentials')
    public async PasswordReset(@Req() req: Request, @Body() userDto: useremailDTO): Promise<any> {


        return this.userService.password_resert(userDto.email);

    }


}

