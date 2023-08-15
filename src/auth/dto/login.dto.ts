import { IsNotEmpty, IsNumberString, IsString, Length, Matches, MaxLength, MinLength, IsEmail} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";



export class LogInDto {

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
    
    @ApiProperty({
        description: 'Password that shall be used by the user for logging in. It must be between 8 and 30 characters',
        example: "Vitra/?13",
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(8,30, {message: 'Password needs to be of 8 characters and up to 30'})
    @Matches('^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})(?=.*[-+!@#$%^&*.;?]{1,}).{8,30}$','', {message: 'INVALIDPASSWORD'})
    password: string;
/*
    @ApiProperty({
        description: 'Time based otp',
        example: '225202',
        type: String
    })
    @IsNumberString()
    @MaxLength(6)
    @MinLength(6)
    otp: string;*/
    
}