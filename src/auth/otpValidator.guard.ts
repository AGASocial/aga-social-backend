import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import {Request } from "express";
import { UsersService } from "src/users/users.service";
import * as speakeasy from 'speakeasy'


//Guard that verifies if the user's One Time Password is valid
@Injectable()
export class OtpValidatorGuard implements CanActivate {

    constructor(private usersService: UsersService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
     
        const req: Request = context.switchToHttp().getRequest();
        const jwtToken:string = req.signedCookies.bearer_token;
        const userId = this.usersService.extractID(jwtToken);
        const userSnap = await this.usersService.getUserById(userId);
        const userOtpSecret = await this.usersService.getUserOtpSecret(userSnap);

        const otp = req.body.otp;

        if (otp != undefined) {
            let isOtpValid: boolean = speakeasy.totp.verify({
                secret: userOtpSecret.ascii,
                encoding: 'ascii',
                token: otp
            });
    
            if(isOtpValid == true) {
                delete req.body[otp];
                return isOtpValid;
            }
            else
                throw new BadRequestException('OTPINVALID');
        }
        else {
            throw new BadRequestException('OTPMISSING');
        }

    }
}