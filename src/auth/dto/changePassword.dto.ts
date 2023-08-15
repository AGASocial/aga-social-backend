import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, Matches } from "class-validator";


export class ChangePasswordDto {

    @ApiProperty({
        description: 'The current password of the user',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(8,30, {message: 'Password needs to be of 8 characters and up to 30'})
    @Matches('^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})(?=.*[-+!@#$%^&*.;?]{1,}).{8,30}$','', {message: 'INVALIDPASSWORD'})
    public password: string;

    @ApiProperty({
        description: 'The new password the user will use, it must be between 5 and 20 characters ',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(8,30, {message: 'Password needs to be of 8 characters and up to 30'})
    @Matches('^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})(?=.*[-+!@#$%^&*.;?]{1,}).{8,30}$','', {message: 'INVALIDPASSWORD'})
    public new_password: string;
}