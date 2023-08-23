import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";
import { DocResult } from "../../utils/docResult.entity";

export class GetUsersEarningsResponseDto {

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
        description: 'Descriptive response message, should return "EARNINGSRETRIEVEDSUCCESSFULLY"',
        default: 'EARNINGSRETRIEVEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;


    @ApiProperty({
        description: 'Array containing the info of the earnings'
    })
    public earningsFound: DocResult[]



    constructor(statusCode: number, message: string, earningsFound: DocResult[]) {
        this.statusCode = statusCode;
        this.message = message;
        this.earningsFound = earningsFound;


    }
}
