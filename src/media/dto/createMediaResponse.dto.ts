import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive, IsOptional } from "class-validator";

export class CreateMediaResponseDto {

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
        description: 'Descriptive response message, should return "MEDICREATEDSUCCESSFULLY"',
        default: 'MEDICREATEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;

    @ApiProperty({
        description: 'ID of the created media',
        type: String
    })
    public mediaId?: string;


    constructor(statusCode: number, message: string, mediaId: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.mediaId = mediaId;

    }
}
