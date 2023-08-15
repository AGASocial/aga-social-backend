import { ApiProperty } from "@nestjs/swagger";
import { DocResult } from "../../utils/docResult.entity";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class GetRolesResponseDto {
    @ApiProperty({
        description: "Http response status code",
        type: String
    })
    @IsNumber()
    @IsNotEmpty()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "ROLESGOT"',
        type: String
    })
    @IsString()
    @IsNotEmpty()
    public message: string;
    @ApiProperty({
        description: 'Array containing the name of every role and their respective ids'
    })
    public rolesFound: DocResult[]
}