import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";

export class UploadEbookResponseDto {

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
        description: 'Descriptive response message, should return "EBOOKUPLOADEDSUCCESSFULLY"',
        default: 'EBOOKUPLOADEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;


    @ApiProperty({
        description: 'ID of the created ebook',
        type: String
    })
    public ebookId?: string;


    constructor(statusCode: number, message: string, ebookId: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.ebookId = ebookId;
    }
}
