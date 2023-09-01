import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsEnum } from 'class-validator';




export class AddMediaOrEbookDto {
    @ApiProperty({
        description: 'Name of the section.',
        example: 'Introduction to Programming',
        type: String,
    })
    sectionId?: string;


    @ApiProperty({
        description: 'Title of the media or ebook.',
        example: 'Introduction Video',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    assetId?: string;
}