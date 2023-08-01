import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsNumber, IsPositive, IsString, IsUppercase, IsUrl } from "class-validator";


export class RecoverOtpResponseDto {

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
        description: 'Descriptive response message, it should return "NEWOTPASSIGNED"',
        default: 'NEWOTPASSIGNED',
        type: String
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;

    @ApiProperty({
        description: 'New otp for the user'
    })
    @IsNotEmpty()
    @IsUrl()
    public otp: string;

    
}