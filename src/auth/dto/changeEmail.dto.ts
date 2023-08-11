import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, Length, MaxLength, IsNumberString, IsEmail } from "class-validator";



export class ChangeEmailDto {
    @ApiProperty({
        description: 'Old email, will be replaced by the new_email',
        example: 'email@test.com',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @Matches('(^([a-z0-9._-]+)@([a-z0-9]+).([a-z]{2,10})(.[.a-z]{3,})?$)|(^[A-Z](?=.{0}[a-z]+[-._]{1}[1-9]{1,4}$).{1,30}$)', '', { message: 'INVALIDUSER' })
    old_email: string;

    @ApiProperty({
        description: 'Security answer used to change email. Must match the one set on sign up',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    public security_answer: string;


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
    public new_email: string;


}