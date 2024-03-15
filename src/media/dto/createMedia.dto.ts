import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsUrl, IsDateString, IsBoolean, IsOptional } from "class-validator";
import { MediaType } from "../entities/media.entity";

export class CreateMediaDto {

    @ApiProperty({
        description: "Type of media (audio or video)",
        enum: MediaType,
    })
    @IsOptional()
    @IsEnum(MediaType)
    type: MediaType; 

    @ApiProperty({
        description: "Title of the audio or video",
        example: "Title of the content",
        type: String,
    })
    @IsOptional()
    @IsString()
    title: string;

    @ApiProperty({
        description: "Description of the audio or video",
        example: "Description of the content",
        type: String,
    })
    @IsOptional()
    @IsString()
    description?: string; 

    @ApiProperty({
        description: "URL of the multimedia file",
        example: "https://file_url.mp3",
        type: String,
    })
    @IsOptional()
    url?: string; 

    @ApiProperty({
        description: "Duration of the multimedia content",
        example: "00:15:30",
        type: String,
    })
    @IsOptional()
    @IsString()
    duration?: string; 

    @ApiProperty({
        description: "Upload date of the multimedia content",
        example: "2023-08-03",
        type: Date,
    })
    @IsOptional()
    uploadDate?: Date; 


    @ApiProperty({
        description: 'Publisher of the media',
        example: 'Pepito Perez',
        type: String,
    })
    @IsOptional()
    @IsString()
    public publisher?: string;


   

}
