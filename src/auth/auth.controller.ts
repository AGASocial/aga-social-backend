import { Body, Controller,Delete,Get,HttpException,HttpStatus,Param,Patch,Post,Put,Query,Req,Res,UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/signup.dto";
import { LogInDto } from "./dto/login.dto";
import { RecoverPasswordDto } from "./dto/recoverPassword.dto";
import { ChangePasswordDto } from "./dto/changePassword.dto"; 
import { LogInResponseDto } from "./dto/loginResponse.dto";
import { SignUpDtoResponse } from "./dto/signupResponse.dto";
import { RecoverPasswordDtoResponse } from "./dto/recoverPasswordResponse.dto";
import { ChangePasswordDtoResponse } from "./dto/changePasswordResponse.dto";
import { Request, Response } from "express";
import { LogOutResponseDto } from "./dto/logoutResponse.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { Throttle } from "@nestjs/throttler";
import { DeleteUserDto } from "./dto/deleteUser.dto";
import { DeleteUserResponseDto } from "./dto/deleteUserResponse.dto";
import { GetUsersResponseDto } from "./dto/getUsersResponse.dto";
import { FreezedGuard } from "../session/freezed.guard";
import { csrfCookieName, generateToken } from "../utils/constants";
import { ChangeSecurityAnswerDto } from "./dto/changeSecurityAnswer.dto";
import { ChangeSecurityAnswerDtoResponse } from "./dto/changeSecurityAnswerResponse.dto";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { UpdateUserResponseDto } from "./dto/updateUserResponse.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { GetUsersEarningsResponseDto } from "./dto/getUsersEarningsResponse.dto";
import { ChangeCredentialsDtoResponse } from "./dto/changeCredentialsResponse.dto";
import { CsrfGuard } from "../session/csrf.guard";
import { CsrfProtectionMiddleware } from "../session/middleware/csrfProtection.middleware";
import { CsrfValidationMiddleware } from "../session/middleware/csrfValidation.middleware";


@Controller('auth')
@ApiTags('Users')
export class AuthController {
    constructor(private authService: AuthService) { }



    @ApiOperation({ summary: 'User sign-up using Firebase' })
    @ApiCreatedResponse({
        description: 'User successfully signed up',
        type: SignUpDtoResponse,
    })
    @ApiBadRequestResponse({
        description: 'Bad Request: Invalid input or user already exists',
    })
    @Post('users')
    async firebaseSignup(@Body() signUpDto: SignUpDto, @Res() res: Response) {

        let signUpDtoResponse: SignUpDtoResponse = await this.authService.firebaseSignUp(signUpDto);

        res.send({
            statusCode: signUpDtoResponse.statusCode,
            message: signUpDtoResponse.message,
        })

    }


    //NOT IN USE
    @ApiOperation({ summary: 'Delete user (Not in use)' })
    @ApiOkResponse({ description: 'User successfully deleted', type: DeleteUserResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or user not found' })
    @Delete('users')
    async deleteUser(@Body() deleteUserDto: DeleteUserDto): Promise<DeleteUserResponseDto> {
        return this.authService.firebaseDeleteUser(deleteUserDto);
    }

    @UseGuards(FreezedGuard)
    @ApiOperation({ summary: 'User login' })
    @ApiOkResponse({ description: 'Login successful', type: LogInResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid credentials or user not found' })

    @Post('users/sessions')
    async firebaseLogin(@Body() logInDto: LogInDto, @Res() res: Response, @Req() req) {

        const loginResponseDto: LogInResponseDto = await this.authService.firebaseLogin(logInDto);

        const { statusCode, message, bearer_token, authCookieAge, refresh_token, refreshCookieAge } = loginResponseDto;

        res.cookie('bearer_token', bearer_token, { signed: true, maxAge: authCookieAge });
        res.cookie('refresh_token', refresh_token, { signed: true, maxAge: refreshCookieAge });
        res.send({
            statusCode,
            message,
        })
    }



    @ApiOperation({ summary: 'Refresh user session' })
    @ApiOkResponse({ description: 'Session refreshed successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized: Invalid or expired refresh token' })
    @Put('users/sessions')
    async firebaseRefresh(@Res() res: Response, @Req() req) {
        const jwtRefreshToken: string = req.signedCookies.refresh_token;
        const refreshDto: RefreshDto = { refresh_token: jwtRefreshToken }
        const { statusCode, message, bearer_token } = await this.authService.firebaseRefresh(refreshDto);
        res.cookie('bearer_token', bearer_token, { signed: true });
        res.send({
            statusCode,
            message
        })
    }



    @ApiOperation({ summary: 'Logout user' })
    @ApiOkResponse({ description: 'User logged out successfully', type: LogOutResponseDto })
    @Get('users/sessions')
    async logout(@Res() res: Response) {
        const logoutResponseDto: LogOutResponseDto = await this.authService.firebaseLogout();
        res.clearCookie('connect.sid');
        res.clearCookie('bearer_token');
        res.clearCookie('refresh_token');
        res.clearCookie(csrfCookieName);

        res.send(logoutResponseDto);
    }








    @ApiOperation({ summary: 'Update user data' })
    @ApiBody({ type: UpdateUserDto })
    @ApiOkResponse({ description: 'User data changed successfully', type: UpdateUserResponseDto })
    @Put('users') 
    async updateUser(
        @Query('id') id: string, 
        @Body() newData: Partial<UpdateUserDto>,
        @Req() req: Request
    ): Promise<UpdateUserResponseDto> {
        try {
            const jwtToken = req.signedCookies.refresh_token;
            const response = await this.authService.updateUser(id, newData, jwtToken);
            return response;
        } catch (error) {
            throw new Error('Failed to update user');
        }
    }


    @ApiOperation({ summary: 'Get user by id or get all users' })
    @ApiParam({ name: 'id', description: 'Id of the user', type: String, required: false })
    @ApiOkResponse({ description: 'User(s) retrieved successfully', type: GetUsersResponseDto })
    @Get('users')
    async getUsersOrSingleUserById(@Query('id') id: string, @Query('email') email: string, @Req() req: Request): Promise<GetUsersResponseDto> {
        if (id) {
            return this.authService.getSingleUser(id);
        }


        else {
            return this.authService.getUsers();
        }
    }




    @ApiOperation({ summary: 'Manage user credentials. Can change security answer, change password or recover password' }) 
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiQuery({ name: 'email', required: false })
    @ApiQuery({ name: 'password', required: false })
    @ApiQuery({ name: 'new_security_answer', required: false })
    @ApiQuery({ name: 'new_password', required: false })
    @ApiQuery({ name: 'security_answer', required: false })
    @Patch('users')
    async manageUserCredentials( 
        @Req() req: Request,
        @Query('id') id: string,
        @Query('password') password: string,
        @Query('new_security_answer') newSecurityAnswer: string,
        @Query('new_password') newPassword: string,
        @Query('security_answer') securityAnswer: string,
    ): Promise<any> {

        const jwtToken = req.signedCookies.refresh_token;

        if (password && newSecurityAnswer) {
            const changeSecurityAnswerDto = new ChangeSecurityAnswerDto();
            changeSecurityAnswerDto.password = password;
            changeSecurityAnswerDto.new_security_answer = newSecurityAnswer;

            return this.authService.changeSecurityAnswer(changeSecurityAnswerDto, jwtToken);
        } else if (password && newPassword) {
            const changePasswordDto = new ChangePasswordDto();
            changePasswordDto.password = password;
            changePasswordDto.new_password = newPassword;
            return this.authService.firebaseChangePassword(changePasswordDto, jwtToken);
        } else if (securityAnswer && newPassword) {
            const recoverPasswordDto = new RecoverPasswordDto();
            recoverPasswordDto.security_answer = securityAnswer;
            recoverPasswordDto.new_password = newPassword;
            return this.authService.firebaseRecoverPassword(recoverPasswordDto, jwtToken);
        } else {
            throw new HttpException('Invalid combination of query parameters', HttpStatus.BAD_REQUEST);
        }
    }




}   