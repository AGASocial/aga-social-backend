import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class GetJsonByIdResponseDto {
    @ApiProperty({
        description: 'HTTP response status code',
        default: 200,
        type: Number,
    })
    @IsNotEmpty()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, should return "JSONRETRIEVEDSUCCESSFULLY"',
        default: 'JSONRETRIEVEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    public message: string;

    @ApiProperty({
        description: 'JSON data',
        type: Object, 
    })
    public jsonData: Record<string, any>;

    constructor(statusCode: number, message: string, jsonData: Record<string, any>) {
        this.statusCode = statusCode;
        this.message = message;
        this.jsonData = jsonData;
    }
}
