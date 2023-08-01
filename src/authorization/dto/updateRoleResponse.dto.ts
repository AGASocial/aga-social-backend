import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsString } from "class-validator";


export class UpdateRoleResponseDto {
    @ApiProperty({
        description: 'Http response status code',
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "ROLEUPDATED"',
        default: "ROLEUPDATED",
        type: String
    })
    @IsString()
    @IsNotEmpty()
    public message: string;
}