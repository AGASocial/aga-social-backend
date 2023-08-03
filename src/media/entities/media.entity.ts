import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsUrl } from "class-validator";


export enum MediaType {
    Audio = "audio",
    Video = "video",
}


export class Media {

    @ApiProperty({
        description: "Type of media (audio or video)",
        enum: MediaType,
    })
    @IsNotEmpty()
    @IsEnum(MediaType)
    type: MediaType;

    @ApiProperty({
        description: "Title of the audio or video",
        example: "Title of the content",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: "Description of the audio or video",
        example: "Description of the content",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        description: "URL of the multimedia file",
        example: "https://file_url.mp3",
        type: String,
    })
    @IsNotEmpty()
    @IsUrl()
    url: string;

    @ApiProperty({
        description: "Duration of the multimedia content",
        example: "00:15:30",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    duration: string;

    @ApiProperty({
        description: "Upload date of the multimedia content",
        example: "2023-08-03",
        type: Date,
    })
    @IsNotEmpty()
    @IsString()
    uploadDate: Date;
}