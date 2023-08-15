import { IsAlpha, IsJWT, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUppercase } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class LogInResponseDto {
    @ApiProperty({
        description: 'Http response status code',
        default: 201,
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "LOGINSUCCESSFUL"',
        default: "LOGINSUCCESSFUL",
        type: String
    })
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;

    @ApiProperty({
        description: 'Bearer token, used for login validation. The payload is user email and user id',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @IsJWT()
    public bearer_token: string;

    @ApiProperty({
        description: 'Max age for the cookie that contains the bearer auth token'
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public authCookieAge: number;

    @ApiProperty({
        description: 'Bearer refresh token, used for validating if the user is allowed to refresh session',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @IsJWT()
    public refresh_token: string;

    @ApiProperty({
        description: 'Max age for the cookie that contains the bearer refresh token'
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public refreshCookieAge: number;


}