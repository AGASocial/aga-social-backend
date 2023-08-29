import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsUrl, IsBoolean } from "class-validator";


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
    public type: MediaType;

    @ApiProperty({
        description: "Title of the audio or video",
        example: "Title of the content",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public title: string;

    @ApiProperty({
        description: "Description of the audio or video",
        example: "Description of the content",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public description: string;

    @ApiProperty({
        description: "URL of the multimedia file",
        example: "https://file_url.mp3",
        type: String,
    })
    @IsNotEmpty()
    @IsUrl()
    public url?: string;

    @ApiProperty({
        description: "Duration of the multimedia content",
        example: "00:15:30",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public duration: string;

    @ApiProperty({
        description: "Upload date of the multimedia content",
        example: "2023-08-03",
        type: Date,
    })
    @IsNotEmpty()
    @IsString()
    public uploadDate?: Date;


    @ApiProperty({
        description: 'Status of the media, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    isActive?: boolean = true;



    @ApiProperty({
        description: 'Publisher of the media',
        example: 'Pepito Perez',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public publisher: string;



    @ApiProperty({
        description: 'Firestore ID of the user',
        example: 'abcdef123456',
        type: String
    })
    id?: string;


    @ApiProperty({
        description: "URL of the multimedia file on Vimeo",
        example: "https://file_url.mp3",
        type: String,
    })
    @IsUrl()
    public vimeoVideo?: string;


}