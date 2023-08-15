import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength } from "class-validator";


export class ChangeCountryDto {



    @ApiProperty({
        description: 'New country for the user',
        example: 'Venezuela',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    public country: string;



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