import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsNumber, IsPositive, IsString, IsUppercase } from "class-validator";

export class DeleteUserResponseDto {
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
        description: 'Descriptive response message, it should return "USERDELETED"',
        default: "USERDELETED",
        type: String
    })
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;
}
