import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class useremailDTO {

    @ApiProperty({ description: 'email' })
    @IsString()
    @IsEmail()
    email: string;

}