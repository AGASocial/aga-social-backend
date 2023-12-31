import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";

export class CreateTagResponseDto {

    @ApiProperty({
        description: 'HTTP response status code',
        default: 201,
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, should return "TAGCREATEDSUCCESSFULLY"',
        default: 'TAGCREATEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;




    @ApiProperty({
        description: 'ID of the created tag',
        type: String
    })
    public tagId?: string;


    constructor(statusCode: number, message: string, tagId: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.tagId = tagId;
    }


}
