import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray } from "class-validator";
import { Section } from "../entities/sections.entity";

export class UpdateSectionDto {
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
        description: 'Tags or keywords describing the section content.',
        example: ['programming', 'introduction', 'development'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiProperty({
        description: 'Subsections within the section.',
        type: [Section], // Each subsection is also a Section entity
    })
    @IsArray()
    public subsections?: Section[];
}
