import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export enum TypeOfResource {
    Video = 'Video',
    Audio = 'Audio',
    Ebook = 'Ebook',
}

export class DeactivateMediaOrEbookFromSectionDto {


    @ApiProperty({
        description: 'Name of the section.',
        example: 'Introduction to Programming',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    name: string;



    @ApiProperty({
        description: 'Title of the media/ebook',
        example: 'Introduction to Programming',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public title: string;

    @ApiProperty({
        description: 'Type of resource to deactivate (Video, Audio, Ebook)',
        enum: TypeOfResource,
        enumName: 'TypeOfResource',
    })
    @IsNotEmpty()
    public type: TypeOfResource;
}
