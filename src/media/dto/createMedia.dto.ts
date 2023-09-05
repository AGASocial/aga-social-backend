import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsUrl, IsDateString, IsBoolean } from "class-validator";
import { MediaType } from "../entities/media.entity";

export class CreateMediaDto {

    @ApiProperty({
        description: "Type of media (audio or video)",
        enum: MediaType,
    })
    @IsNotEmpty()
    @IsEnum(MediaType)
    type: MediaType; //MediaType

    @ApiProperty({
        description: "Title of the audio or video",
        example: "Title of the content",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    title: string;  //Title

    @ApiProperty({
        description: "Description of the audio or video",
        example: "Description of the content",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    description?: string; //Description

    @ApiProperty({
        description: "URL of the multimedia file",
        example: "https://file_url.mp3",
        type: String,
    })
    @IsNotEmpty()
    @IsUrl()
    url?: string; //URL

    @ApiProperty({
        description: "Duration of the multimedia content",
        example: "00:15:30",
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    duration?: string; //Duration

    @ApiProperty({
        description: "Upload date of the multimedia content",
        example: "2023-08-03T12:34:56Z",
        type: Date,
    })
    uploadDate?: Date; //UploadDate

    @ApiProperty({
        description: 'Status of the ebook, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    active?: boolean = true; //isActive


    @ApiProperty({
        description: 'Publisher of the media',
        example: 'Pepito Perez',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public publisher?: string;


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
    public vimeoVideo?: string;

}
