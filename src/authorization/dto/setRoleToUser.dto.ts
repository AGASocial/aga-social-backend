import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEmpty, IsNotEmpty, IsString, IsUUID } from "class-validator";


export class SetRoleToUserDto {
    @ApiProperty({
        description: "User who's role will be set",
        type: String
    })
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    public email: string;

    @ApiProperty({
        description: "Role to be set for the user",
        type: String
    })
    @IsNotEmpty()
    @IsString()
    public role: string;
}