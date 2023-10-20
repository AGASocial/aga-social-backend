import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsUrl, IsBoolean } from "class-validator";


export enum MediaType {
    Audio = "audio",
    Video = "video",
}


export class UpdateMediaDto {

    @ApiProperty({
        description: "Type of media (audio or video)",
        enum: MediaType,
    })
    @IsEnum(MediaType)
    type?: MediaType;

    @ApiProperty({
        description: "Title of the audio or video",
        example: "Title of the content",
        type: String,
    })
    @IsString()
    title?: string;

    @ApiProperty({
        description: "Description of the audio or video",
        example: "Description of the content",
        type: String,
    })
    @IsString()
    description?: string;

    @ApiProperty({
        description: "URL of the multimedia file",
        example: "https://file_url.mp3",
        type: String,
    })
    @IsUrl()
    url?: string;

    @ApiProperty({
        description: "Duration of the multimedia content",
        example: "00:15:30",
        type: String,
    })
    @IsString()
    duration?: string;

    @ApiProperty({
        description: "Upload date of the multimedia content",
        example: "2023-08-03",
        type: Date,
    })
    @IsString()
    uploadDate?: Date;


    @ApiProperty({
        description: 'Status of the ebook, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    active?: boolean = true; //isActive


    @ApiProperty({
        description: "URL of the multimedia file on Vimeo",
        example: "https://file_url.mp3",
        type: String,
    })
    @IsUrl()
    public vimeoVideo?: string;

    @ApiProperty({
        description: 'Firestore ID of the media',
        example: 'abcdef123456',
        type: String
    })
    @IsNotEmpty()
    id: string;


}