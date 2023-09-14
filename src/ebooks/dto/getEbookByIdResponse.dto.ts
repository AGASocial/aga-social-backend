import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";
import { DocResult } from "../../utils/docResult.entity";
import { Ebook } from "../entities/ebooks.entity";

export class GetEbookByIdResponseDto {

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
        description: 'Descriptive response message, should return "EBOOKRETRIEVEDSUCCESSFULLY"',
        default: 'EBOOKRETRIEVEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;


    @ApiProperty({
        description: 'Information about the found ebook'
    })
    public ebookFound: Ebook



  
}
