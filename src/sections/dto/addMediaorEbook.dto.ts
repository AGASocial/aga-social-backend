import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMediaDto } from '../../media/dto/createMedia.dto';
import { CreateEbookDto } from '../../ebooks/dto/createEbook.dto';
import { Media } from '../../media/entities/media.entity';
import { Ebook } from '../../ebooks/entities/ebooks.entity';

export enum ResourceType {
    Media = 'Media',
    Ebook = 'Ebook',
}

export class AddMediaOrEbookDto {
    @ApiProperty({
        description: 'Name of the section.',
        example: 'Introduction to Programming',
        type: String,
    })
    sectionName?: string;

    @ApiProperty({
        description: 'Type of resource (Media or Ebook)',
        enum: ResourceType,
        type: String,
    })
    @IsNotEmpty()
    @IsEnum(ResourceType)
    typeOfResource: ResourceType;

    @ApiProperty({
        description: 'Title of the media or ebook.',
        example: 'Introduction Video',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    title: string;
}