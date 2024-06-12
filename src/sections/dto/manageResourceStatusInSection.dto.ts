import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray, IsBoolean } from "class-validator";
import { Section } from "../entities/sections.entity";

export class ManageResourceStatusInSectionDto {
 



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
        example: ['65c8cf10-3726-4776-a35a-b0e5867dcf64'],
        type: [String],
    })
    @IsString({ each: true })
    assetIds?: string[];

}
