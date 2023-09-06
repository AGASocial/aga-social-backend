import { IsNotEmpty, IsString, MaxLength, Matches, Length, IsEmail } from 'class-validator';
import * as validationRules from '../../../validations.json';
export class SignUpDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @IsEmail()
    public email: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(validationRules.usernameValidation.maxLength)
    @Matches(new RegExp(validationRules.usernameValidation.pattern), {
        message: 'Username must start with a letter and only contain alphanumeric characters and underscores'
    })
    public username: string;

    @IsNotEmpty()
    @IsString()
    @Length(
        validationRules.passwordValidation.minLength,
        validationRules.passwordValidation.maxLength,
        { message: 'Password length must be between 8 and 30 characters' }
    )
    public password: string;
}
