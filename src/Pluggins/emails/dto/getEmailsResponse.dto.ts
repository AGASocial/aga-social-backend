import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsNumber, IsPositive, IsString, IsUppercase } from "class-validator";




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
        description: 'Descriptive response message, should return "EMAILSRETRIEVEDSUCCESSFULLY"',
        default: 'EMAILSRETRIEVEDSUCCESSFULLY',
        type: String,
    })
    public emailList: string[];



    constructor(statusCode: number, message: string, emailList: string[]) {
        this.statusCode = statusCode;
        this.message = message;
        this.emailList = emailList;
    }



}
