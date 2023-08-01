import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsString } from "class-validator";


export class SetRoleToUserResponseDto {
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
        description: 'Descriptive response message, it should return "ROLESETTOUSER"',
        minimum: 1,
        default: 1,
        type: String
    })
    @IsString()
    @IsNotEmpty()
    public message: string;
}