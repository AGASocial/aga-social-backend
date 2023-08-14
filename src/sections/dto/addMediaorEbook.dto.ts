import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMediaDto } from '../../media/dto/createMedia.dto';
import { CreateEbookDto } from '../../ebooks/dto/createEbook.dto';

export class AddMediaOrEbookDto {
    @ApiProperty({
        description: 'Name of the section.',
        example: 'Introduction to Programming',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    sectionName: string;

    @ApiProperty({
        description: 'Media (audios or videos) and Ebooks associated with the section.',
        type: [CreateEbookDto, CreateMediaDto],
    })
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateMediaDto)
    @Type(() => CreateEbookDto)
    mediaOrEbookData: CreateMediaDto | CreateEbookDto;
}
