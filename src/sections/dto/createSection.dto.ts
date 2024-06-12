import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray, IsOptional } from "class-validator";
import { CreateEbookDto } from "../../ebooks/dto/createEbook.dto";
import { Ebook } from "../../ebooks/entities/ebooks.entity";
import { CreateMediaDto } from "../../media/dto/createMedia.dto";
import { Media } from "../../media/entities/media.entity";
import { Section } from "../entities/sections.entity";

export class CreateSectionDto {
    @ApiProperty({
        description: 'Name of the section.',
        example: 'Introduction to Programming',
        type: String,
    })
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Description of the section.',
        example: 'A comprehensive introduction to basic programming concepts.',
        type: String,
    })
    @IsOptional()
    description?: string;

   

    @ApiProperty({
        description: 'Media (audios or videos) and Ebooks associated with the section.',
    })
    content?: any[];

    @ApiProperty({
        description: 'Tags or keywords describing the section content.',
        example: ['programming', 'introduction', 'development'],
        type: [String],
    })
    @IsOptional()
    tags?: string[];



    @ApiProperty({
        description: 'Ids of the media/ebooks that will be added to the section content. Must already exist in firestore and datastorage',
        example: ['65c8cf10-3726-4776-a35a-b0e5867dcf64'],
        type: [String],
    })
    @IsOptional()
    assetsIds?: string[];




    @ApiProperty({
        description: 'Ids of subsections',
        example: ['bb48fcc3-088a-41ed-9623-ee7be8e3fe14'],
        type: [String],
    })
    @IsOptional()
    subsections?: string[];

}
