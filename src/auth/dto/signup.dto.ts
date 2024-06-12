import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Matches, Length, IsEmail } from 'class-validator';
import * as validationRules from '../../../validations.json';






export interface Validation {
    minLength: number;
    maxLength: number;
    pattern?: string;
}



export class SignUpDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @IsEmail()
    @ApiProperty({ example: 'example@example.com' })
    public email: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(validationRules.username.maxLength)
    @Matches(new RegExp(validationRules.username.pattern), {
        message: 'Username must start with a letter and only contain alphanumeric characters and underscores'
    })
    @ApiProperty({ example: 'MyUsername123' })
    public username: string;

    @IsNotEmpty()
    @IsString()
    @Length(
        validationRules.password.minLength,
        validationRules.password.maxLength,
        { message: 'Password length must be between 8 and 30 characters' }
    )
    @ApiProperty({ example: 'P@ssw0rd' })
    public password: string;
}
