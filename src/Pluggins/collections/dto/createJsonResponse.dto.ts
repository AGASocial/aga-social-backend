import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";

export class CreateJsonResponseDto {

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
        description: 'Descriptive response message, should return "JSONREGISTEREDSUCCESSFULLY"',
        default: 'JSONREGISTEREDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;



    @ApiProperty({
        description: 'ID of the user',
        type: String
    })
    public jsonId?: string;



    constructor(statusCode: number, message: string, jsonId: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.jsonId = jsonId;
    }
}
