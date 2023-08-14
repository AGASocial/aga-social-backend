import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";
import { DocResult } from "../../utils/docResult.entity";

export class GetCouponsResponseDto {

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
        description: 'Descriptive response message, should return "COUPONSRETRIEVEDSUCCESSFULLY"',
        default: 'COUPONSRETRIEVEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;


    @ApiProperty({
        description: 'Array containing the info of every coupon found'
    })
    public couponsFound: DocResult[]



    constructor(statusCode: number, message: string, couponsFound: DocResult[]) {
        this.statusCode = statusCode;
        this.message = message;
        this.couponsFound = couponsFound;


    }
}
