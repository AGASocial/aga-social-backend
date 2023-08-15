import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength } from "class-validator";


export class ChangeNameDto {

    @ApiProperty({
        description: 'The current password of the user',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(8, 30, { message: 'Password needs to be of 8 characters and up to 30' })
    @Matches('^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})(?=.*[-+!@#$%^&*.;?]{1,}).{8,30}$', '', { message: 'INVALIDPASSWORD' })
    public password: string;



    @ApiProperty({
        description: 'New name that will replace the old one',
        example: 'Pepe',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Matches('^(?=.*[a-zA-Z ]{1,}).{1,60}$', '', { message: 'Name must be a real name, no numbers nor special characters' })
    public name: string;



    //regex para email
    //([a-z0-9._-]+)@([a-z0-9]+).([a-z]{2,10})(.[.a-z]{3,})?
    //regex para username
    //^[A-Z](?=.{0}[a-z]+[-._]{1}[1-9]{1,4}$).{1,20}$
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


}