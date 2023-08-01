import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsString, IsPositive, IsAlpha, IsUppercase } from "class-validator";


export class DeleteRoleOfUserResponseDto {
    @ApiProperty({
        description: 'Http response status code',
        default: 200,
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "ROLEREVOKED"',
        default: "ROLEREVOKED",
        type: String
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;
}