import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength } from "class-validator";



export class SignUpDto {
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

    @ApiProperty({
        description: 'Username the user will use for login, it must be unique between users',
        example: 'Test.1',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    @Matches('^[A-Z](?=.{0}[a-z]+[-._]{1}[1-9]{1,4}$).{1,20}$','',{message: 'INVALIDUSERNAME'})
    public username: string;

    @ApiProperty({
        description: 'Password that shall be used by the user for logging in. It must be between 8 and 30 characters',
        example: "Vitra/?13",
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(8,30, {message: 'Password needs to be of 8 characters and up to 30'})
    @Matches('^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})(?=.*[-+!@#$%^&*.;?]{1,}).{8,30}$','', {message: 'INVALIDPASSWORD'})
    public password: string;

    @ApiProperty({
        description: 'Real name of the user',
        example: 'Juan Lopez',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Matches('^(?=.*[a-zA-Z ]{1,}).{1,60}$','',{message: 'Name must be a real name, no numbers nor special characters'})
    public name: string;

    @ApiProperty({
        description: 'Security answer used by the user for recovering access when their current password has been lost',
        example: 'perfect blue',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    public security_answer: string;




    @ApiProperty({
        description: 'Firestore ID of the user',
        example: 'abcdef123456',
        type: String
    })
    id?: string;
}