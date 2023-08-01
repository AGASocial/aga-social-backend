import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsNumber, IsPositive, IsString, IsUppercase, IsUrl } from "class-validator";


export class SignUpDtoResponse {

    @ApiProperty({
        description: 'Http response status code',
        default: 201,
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "SIGNUPSUCCESSFUL"',
        default: 'SIGNUPSUCCESSFUL',
        type: String
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;

    @ApiProperty({
        description: 'Otp secret for the user, used to validate 2fa'
    })
    @IsNotEmpty()
    @IsUrl()
    public otp: string;

    
}