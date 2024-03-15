import { IsNotEmpty, IsNumberString, IsString, Length, Matches, MaxLength, MinLength, IsEmail} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";



export class LogInDto {

   
    @ApiProperty({
        description: 'Email the user will use, it must be unique between users',
        example: 'banefarmcok@gmail.com',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @MaxLength(50)
    public email: string;
    
    @ApiProperty({
        description: 'Password that shall be used by the user for logging in. It must be between 8 and 30 characters',
        example: "11092001",
        type: String
    })
    @IsNotEmpty()
    @IsString()
    password: string;

    
}