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
    description: string;

   

    @ApiProperty({
        description: 'Media (audios or videos) and Ebooks associated with the section.',
        type: [CreateEbookDto, CreateMediaDto],
    })
    @IsNotEmpty()
    @IsArray()
    content: (CreateMediaDto | CreateEbookDto)[];

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
        description: 'Subsections within the section.',
        type: [Section], // Each subsection is also a Section entity
    })
    public subsections?: Section[];
}
