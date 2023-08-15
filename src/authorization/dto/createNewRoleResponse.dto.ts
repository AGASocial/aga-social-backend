import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsString, IsAlpha, IsUppercase, IsPositive } from "class-validator";

export class CreateNewRoleResponseDto {
    @ApiProperty({
        description: 'Http response status code',
        default: 201,
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "ROLECREATED"',
        default: "ROLECREATED",
        type: String
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;
}