import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive, IsOptional } from "class-validator";

export class UploadMediaResponseDto {

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
        description: 'Descriptive response message, should return "MEDIAUPLOADEDSUCCESSFULLY"',
        default: 'MEDIAUPLOADEDSUCCESSFULLY',
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

    @ApiProperty({
        description: 'url of the media from youtube or other platforms',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    public url: string;

    constructor(statusCode: number, message: string, mediaId: string, url: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.mediaId = mediaId;
        this.url = url
    }
}

