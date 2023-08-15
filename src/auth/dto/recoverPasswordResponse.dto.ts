import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class RecoverPasswordDtoResponse {
    @ApiProperty({
        description: 'Http response status code',
        minimum: 1,
        default: 1,
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "NEWPASSWORDASSIGNED"',
        minimum: 1,
        default: 1,
        type: String
    })
    @IsString()
    @IsNotEmpty()
    public message: string;
    
}