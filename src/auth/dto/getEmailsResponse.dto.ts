import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";

export class GetEmailsResponseDto {

    @ApiProperty({
        description: 'HTTP response status code',
        default: 201,
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, should return "EMAILSRETRIEVEDSUCCESSFULLY"',
        default: 'EMAILSRETRIEVEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;

    @ApiProperty({
        description: 'Array containing the email addresses of users'
    })
    public emailsFound?: string[]; 

    constructor(statusCode: number, message: string, emailsFound: string[]) {
        this.statusCode = statusCode;
        this.message = message;
        this.emailsFound = emailsFound;
    }
}
