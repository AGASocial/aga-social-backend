import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";

export class PersonalizeEbookResponseDto {

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
        description: 'Descriptive response message, should return "EBOOKPERSONALIZEDSUCCESSFULLY"',
        default: 'EBOOKPERSONALIZEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;


    @ApiProperty({
        description: 'Url to download the ebook',
        type: String
    })
    public downloadUrl?: string;


    constructor(statusCode: number, message: string, downloadUrl: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.downloadUrl = downloadUrl;
    }
}
