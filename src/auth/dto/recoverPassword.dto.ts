import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, Length, MaxLength, IsNumberString } from "class-validator";

export class RecoverPasswordDto {
    @ApiProperty({
        description: 'Firestore ID of the user',
        example: 'abcdef123456',
        type: String
    })
    id: string;



    @ApiProperty({
        description: 'Security answer used to create a new password when the former was lost. Must match the one set on sign up',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    public security_answer: string;

    @ApiProperty({
        description: 'New password that will be set for the user, substitutes the lost one',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(8,30, {message: 'Password needs to be of 8 characters and up to 30'})
    public new_password: string;

    
}