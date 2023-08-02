import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsArray, IsEmail, IsLowercase, IsNotEmpty, IsString, Length, Matches, MaxLength } from "class-validator";
import { Role } from 'src/roles/entities/role.entity'

export class User {

    @ApiProperty({
        description: 'Email the user will use, it must be unique between users',
        example: 'test@gmail.com',
        type: String
    })
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string; //Email

    @ApiProperty({
        description: 'Username the user will use for login, it must be unique between users',
        example: 'Test.1',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    @Matches('^[A-Z](?=.{0}[a-z]+[-._]{1}[1-9]{1,4}$).{1,20}$', '', { message: 'INVALIDUSERNAME' })
    username: string;  //Username

    @ApiProperty({
        description: 'Password that shall be used by the user for logging in. It must be between 8 and 30 characters',
        example: "Vitra/?13",
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(8, 30, { message: 'Password needs to be of 8 characters and up to 30' })
    @Matches('^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})(?=.*[-+!@#$%^&*.;?]{1,}).{8,30}$', '', { message: 'INVALIDPASSWORD' })
    password: string; //Password

    @ApiProperty({
        description: 'Real name of the user',
        example: 'Juan Lopez',
        type: String
    })
    @IsAlpha()
    @IsNotEmpty()
    @IsString()
    @Matches('^(?=.*[a-zA-Z]{1,}).{1,60}$', '', { message: 'Name must be a real name, no numbers nor special characters' })
    public name: string;  //Real Name

    @ApiProperty({
        description: 'Security answer used by the user for recovering access when their current password has been lost',
        example: 'perfect blue',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    security_answer: string; //Security Answer

    

    @ApiProperty({
        description: "Role the user has, each role has a set of privileges",
        example: "admin"
    })
    @IsArray()
    @IsNotEmpty()
    @IsLowercase({ each: true })
    @IsAlpha('es-ES', { each: true })
    @MaxLength(20, { each: true })
    role: Role[];  //Role

}