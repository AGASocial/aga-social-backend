import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray } from "class-validator";
import { Ebook } from "../../ebooks/entities/ebooks.entity";
import { Media } from "../../media/entities/media.entity";
import { UserProjection } from "../dto/userProjection.dto";

export class Section {
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
        type: [Media, Ebook],
    })
    @IsNotEmpty()
    @IsArray()
    content: (Media | Ebook)[]; 

    @ApiProperty({
        description: 'Tags or keywords describing the section content.',
        example: ['programming', 'introduction', 'development'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    tags: string[];
}
