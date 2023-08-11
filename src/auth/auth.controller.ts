import { Body, Controller,Delete,Get,Param,Post,Put,Req,Res,UseGuards } from "@nestjs/common";
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
import { csrfCookieName } from "../utils/constants";
import { ChangeUsernameDto } from "./dto/changeUsername.dto";
import { ChangeUsernameDtoResponse } from "./dto/changeUsernameResponse.dto";
import { ChangeEmailDto } from "./dto/changeEmail.dto";
import { ChangeEmailDtoResponse } from "./dto/changeEmailResponse.dto";
import { ChangeNameDto } from "./dto/changeName.dto";
import { ChangeNameDtoResponse } from "./dto/changeNameResponse.dto";
import { ChangeSecurityAnswerDto } from "./dto/changeSecurityAnswer.dto";
import { ChangeSecurityAnswerDtoResponse } from "./dto/changeSecurityAnswerResponse.dto";


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('firebase/signup')
    async firebaseSignup(@Body() signUpDto: SignUpDto, @Res() res: Response) {

        let signUpDtoResponse: SignUpDtoResponse = await this.authService.firebaseSignUp(signUpDto);

        res.send ({
            statusCode: signUpDtoResponse.statusCode,
            message: signUpDtoResponse.message,
        })

    }

    @Delete('firebase/delete')
    async deleteUser(@Body() deleteUserDto: DeleteUserDto): Promise<DeleteUserResponseDto> {
        return this.authService.firebaseDeleteUser(deleteUserDto);
    }


    @UseGuards(FreezedGuard)
    @Post('firebase/login')
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

  
    @Put('firebase/session')
    async firebaseRefresh(@Res() res: Response, @Req() req){
        const jwtRefreshToken: string = req.signedCookies.refresh_token;
        const refreshDto: RefreshDto = {refresh_token: jwtRefreshToken}
        const {statusCode, message, bearer_token} = await this.authService.firebaseRefresh(refreshDto);
        res.cookie('bearer_token',bearer_token, {signed: true});
        res.send({
            statusCode,
            message
        })
    }

  
    
    @Post('firebase/credentials')
    firebaseRecoverPassword(@Body() recoverPasswordDto: RecoverPasswordDto): Promise<RecoverPasswordDtoResponse>{
        return this.authService.firebaseRecoverPassword(recoverPasswordDto);
    }


    @Put('firebase/credentials')
    firebaseChangePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: Request): Promise<ChangePasswordDtoResponse>{

        const jwtToken = req.signedCookies.refresh_token;
        return this.authService.firebaseChangePassword(changePasswordDto, jwtToken);
    }


    @Get('firebase/logout')
    async logout(@Res() res: Response) {
        const logoutResponseDto: LogOutResponseDto = await this.authService.firebaseLogout();
        res.clearCookie('connect.sid');
        res.clearCookie('bearer_token');
        res.clearCookie('refresh_token');
        res.clearCookie(csrfCookieName);
        
        res.send(logoutResponseDto);
    }


    @Get('firebase/users')
    async getUsers(@Req() req: Request): Promise<GetUsersResponseDto> {

        return this.authService.getUsers();
    }



    @Get('firebase/users/:email')
    async getSingleUser(@Param('email') email: string): Promise<GetUsersResponseDto> {
        return this.authService.getSingleUser(email);
    }






    @Put('firebase/users/username') 
    async changeUsername(@Body() changeUsernameDto: ChangeUsernameDto, @Req() req: Request): Promise<ChangeUsernameDtoResponse> {
        const jwtToken = req.signedCookies.refresh_token;
        return this.authService.changeUsername(changeUsernameDto, jwtToken);
    }


    @Put('firebase/users/email')
    async changeEmail(
        @Body() changeEmailDto: ChangeEmailDto,
        @Req() req: Request,
    ): Promise<ChangeEmailDtoResponse> {
        const jwtToken = req.signedCookies.refresh_token;
        return this.authService.changeEmail(changeEmailDto, jwtToken);
    }



    @Put('firebase/users/name')
    async changeName(@Body() changeNameDto: ChangeNameDto, @Req() req: Request): Promise<ChangeNameDtoResponse> {
        const jwtToken = req.signedCookies.refresh_token;
        return this.authService.changeName(changeNameDto, jwtToken);
    }


    @Put('firebase/users/security-answer') 
    async changeSecurityAnswer(@Body() changeSecurityAnswerDto: ChangeSecurityAnswerDto, @Req() req: Request): Promise<ChangeSecurityAnswerDtoResponse> {
        const jwtToken = req.signedCookies.refresh_token;
        return this.authService.changeSecurityAnswer(changeSecurityAnswerDto, jwtToken);
    }



}   