import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class PassworduserDTO {

    @ApiProperty({ description: 'email' })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'password' })
    @IsString()
    @MinLength(8)
    password: string;


}