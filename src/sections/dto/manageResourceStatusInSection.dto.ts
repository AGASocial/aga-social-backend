import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray, IsBoolean } from "class-validator";
import { Section } from "../entities/sections.entity";

export class ManageResourceStatusInSectionDto {
    @ApiProperty({
        description: 'Name of the section.',
        example: 'Introduction to Programming',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    sectionName?: string;




    @ApiProperty({
        description: 'Status of the section, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    isActive?: boolean = true;



    @ApiProperty({
        description: 'Titles of the media/ebooks that will be added to the section content.',
        example: ['mediatitle', 'ebooktitle'],
        type: [String],
    })
    @IsString({ each: true })
    assetTitles?: string[];

}
