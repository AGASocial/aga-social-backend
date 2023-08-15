import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsNumber, IsPositive, IsString, IsUppercase } from "class-validator";


export class ChangePasswordDtoResponse {
    @ApiProperty({
        description: 'Http response status code',
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "NEWPASSWORDASSIGNED"',
        type: String
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: String;
    
}