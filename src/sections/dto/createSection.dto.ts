import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray } from "class-validator";
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
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Description of the section.',
        example: 'A comprehensive introduction to basic programming concepts.',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
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
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    tags: string[];



    @ApiProperty({
        description: 'Titles of the media/ebooks that will be added to the section content. Must already exist in firestore and datastorage',
        example: ['mediatitle', 'ebooktitle'],
        type: [String],
    })
    @IsString({ each: true })
    assetsIds?: string[];




    @ApiProperty({
        description: 'Subsections within the section.',
        type: [Section], // Each subsection is also a Section entity
    })
    public subsections?: Section[];

    @ApiProperty({
        description: 'Firestore ID of the user',
        example: 'abcdef123456',
        type: String
    })
    id?: string;
}
