import { Body, Controller,Delete,Get,HttpException,HttpStatus,Param,Patch,Post,Put,Query,Req,Res,UploadedFile,UseGuards, UseInterceptors } from "@nestjs/common";
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
import { FileInterceptor } from "@nestjs/platform-express";
import { profile } from "console";


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
            userId: signUpDtoResponse.userId,

        })

    }



    @UseGuards(FreezedGuard)
    @ApiOperation({ summary: 'User login' })
    @ApiOkResponse({ description: 'Login successful', type: LogInResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid credentials or user not found' })

    @Post('users/sessions')
    async firebaseLogin(@Body() logInDto: LogInDto, @Res() res: Response, @Req() req) {

        const loginResponseDto: LogInResponseDto = await this.authService.firebaseLogin(logInDto);

        const { statusCode, message, userId, bearer_token, authCookieAge, refresh_token, refreshCookieAge } = loginResponseDto;

        res.cookie('bearer_token', bearer_token, { signed: true, maxAge: authCookieAge });
        res.cookie('refresh_token', refresh_token, { signed: true, maxAge: refreshCookieAge });
        res.send({
            statusCode,
            message,
            userId,
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
    @UseInterceptors(FileInterceptor('profilePicture')) 
    @Put('users') 
    async updateUser(
        @Query('id') id: string, 
        @Body() newData?: Partial<UpdateUserDto>,
        @UploadedFile() profilePicture?: any
    ): Promise<UpdateUserResponseDto> {
        try {
            if (!profilePicture && newData) {
                const response = await this.authService.updateUser(id, newData);
                return response;
            }
            else if (profilePicture) {
                const response = await this.authService.uploadProfilePicture(id, profilePicture);
                return response;

            }
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
        @Body() credentials: {
            password?: string,
            new_security_answer?: string,
            new_password?: string,
            security_answer?: string,
        }
    ): Promise<any> {
        const jwtToken = req.signedCookies.refresh_token;

        if (credentials.password && credentials.new_security_answer) {
            const changeSecurityAnswerDto = new ChangeSecurityAnswerDto();
            changeSecurityAnswerDto.password = credentials.password;
            changeSecurityAnswerDto.new_security_answer = credentials.new_security_answer;

            return this.authService.changeSecurityAnswer(changeSecurityAnswerDto, jwtToken);
        } else if (credentials.password && credentials.new_password) {
            const changePasswordDto = new ChangePasswordDto();
            changePasswordDto.password = credentials.password;
            changePasswordDto.new_password = credentials.new_password;
            return this.authService.firebaseChangePassword(changePasswordDto, jwtToken);
        } else if (credentials.security_answer && credentials.new_password) {
            const recoverPasswordDto = new RecoverPasswordDto();
            recoverPasswordDto.security_answer = credentials.security_answer;
            recoverPasswordDto.new_password = credentials.new_password;
            return this.authService.firebaseRecoverPassword(recoverPasswordDto, jwtToken);
        } else {
            throw new HttpException('Invalid combination of credentials', HttpStatus.BAD_REQUEST);
        }
    }




}   