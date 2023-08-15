import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength } from "class-validator";


export class ChangeSecurityAnswerDto {

    @ApiProperty({
        description: 'Email the user will use, it must be unique between users',
        example: 'test@gmail.com',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @MaxLength(50)
    public email: string;


    @IsNotEmpty()
    @IsString()
    @Length(8, 30, { message: 'Password needs to be of 8 characters and up to 30' })
    @Matches('^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})(?=.*[-+!@#$%^&*.;?]{1,}).{8,30}$', '', { message: 'INVALIDPASSWORD' })
    public password: string;


    @ApiProperty({
        description: 'New security answer used by the user for recovering access when their current password has been lost',
        example: 'perfect blue',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    public new_security_answer: string;



}