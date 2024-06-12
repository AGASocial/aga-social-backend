import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsArray, IsBoolean, IsEmail, IsLowercase, IsNotEmpty, IsNumber, IsString, Length, Matches, MaxLength } from "class-validator";

export class UpdateUserDto {

   

    @ApiProperty({
        description: 'Username the user will use for login, it must be unique between users',
        example: 'Test.1',
        type: String
    })
    @MaxLength(20)
    @Matches('^[A-Z](?=.{0}[a-z]+[-._]{1}[1-9]{1,4}$).{1,20}$', '', { message: 'INVALIDUSERNAME' })
    username?: string;  //Username

  

    @ApiProperty({
        description: 'Real name of the user',
        example: 'Juan Lopez',
        type: String
    })
    @Matches('^(?=.*[a-zA-Z]{1,}).{1,60}$', '', { message: 'Name must be a real name, no numbers nor special characters' })
    public name?: string;  //Real Name

   


    @ApiProperty({
        description: 'Description of the user',
        example: 'Hello, I am...',
        type: String
    })
    description?: string;


    @ApiProperty({
        description: 'Country of the user',
        example: 'Venezuela',
        type: String
    })
    country?: string;

    @ApiProperty({
        description: 'Phone number of the user',
        example: '+58 252 6673',
        type: String
    })
    phoneNumber?: string;

    @ApiProperty({
        description: 'Status of the users account',
        example: true,
        default: true,
        type: String
    })
    active?: boolean = true;





    @ApiProperty({
        description: 'New email the user will use, it must be unique between users',
        example: 'test@gmail.com',
        type: String
    })
    email?: string; //Email



  
}


