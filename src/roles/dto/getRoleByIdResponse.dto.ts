import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsNumber, IsObject, IsPositive, IsString, IsUppercase } from "class-validator";
import { DocumentData } from "firebase/firestore";


export class GetRoleByIdResponseDto {
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
        description: 'Descriptive response message, it should return "ROLEGOTEN"',
        default: 200,
        type: String
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;

    @ApiProperty({
        description: "Information of the obtained role"
    })
    @IsNotEmpty()
    @IsObject()
    public data: DocumentData;
}