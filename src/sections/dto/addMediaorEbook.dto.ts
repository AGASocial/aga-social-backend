import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsEnum } from 'class-validator';




export class AddMediaOrEbookDto {
    @ApiProperty({
        description: 'IDof the section.',
        type: String,
    })
    sectionId?: string;


    @ApiProperty({
        description: 'ID of the media or ebook.',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    assetId?: string;
}