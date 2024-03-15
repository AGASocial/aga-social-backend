import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, Length, MaxLength, IsNumberString, IsEmail, IsOptional } from "class-validator";

export class RecoverPasswordDto {



    @ApiProperty({
        description: 'Email the user will use, it must be unique between users',
        example: 'test1@mentality.io',
        type: String
    })
    @IsOptional()
    public email?: string;


    @IsOptional()
    @ApiProperty({
        description: 'Current password of the user',
        example: 'pepito123.',
        type: String
    })
    public password?: string;

    @ApiProperty({
        description: 'The new password the user will use ',
        example: 'pepito000.',
        type: String
    })
    @IsOptional()
    @Length(8, 30, { message: 'Password needs to be of 8 characters and up to 30' })
    public new_password?: string;



}