import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray, IsBoolean } from "class-validator";
import { Section } from "../entities/sections.entity";

export class ManageResourceStatusInSubsectionDto {
    @ApiProperty({
        description: 'Id of the primary section.',
        example: 'I61654jhj455df6g4fd65',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    SectionId?: string;



    @ApiProperty({
        description: 'Id of the subsection.',
        example: 'I61654jhj455df6g4fd65',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    SubsectionId?: string;





    @ApiProperty({
        description: 'Status of the section, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    active?: boolean = true;



    @ApiProperty({
        description: 'Titles of the media/ebooks that will be added to the section content.',
        example: ['mediatitle', 'ebooktitle'],
        type: [String],
    })
    @IsString({ each: true })
    assetIds?: string[];

}
