import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class LogOutResponseDto {
    @ApiProperty({
        description: 'Http response status code',
        default: 200,
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "LOGINSUCCESSFUL"',
        default: "LOGOUTSUCCESSFUL",  //modified
        type: String
    })
    @IsString()
    @IsNotEmpty()
    public message: string;
}