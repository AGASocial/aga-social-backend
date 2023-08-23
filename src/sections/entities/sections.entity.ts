import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray, IsBoolean } from "class-validator";
import { CreateEbookDto } from "../../ebooks/dto/createEbook.dto";
import { Ebook } from "../../ebooks/entities/ebooks.entity";
import { CreateMediaDto } from "../../media/dto/createMedia.dto";
import { Media } from "../../media/entities/media.entity";

export class Section {
    @ApiProperty({
        description: 'Name of the section.',
        example: 'Introduction to Programming',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
   public name: string;

    @ApiProperty({
        description: 'Description of the section.',
        example: 'A comprehensive introduction to basic programming concepts.',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
   public description?: string;


    @ApiProperty({
        description: 'Media (audios or videos) and Ebooks associated with the section.',
        type: [Media, Ebook, CreateMediaDto, CreateEbookDto],
    })
    public content?: (Media | Ebook | CreateMediaDto | CreateEbookDto)[]; 

    @ApiProperty({
        description: 'Tags or keywords describing the section content.',
        example: ['programming', 'introduction', 'development'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    public tags: string[];




    @ApiProperty({
        description: 'Status of the section, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    isActive?: boolean = true;


    @ApiProperty({
        description: 'Subsections within the section.',
        type: [Section], // Each subsection is also a Section entity
    })
    public subsections?: Section[]; 



    @ApiProperty({
        description: 'Firestore ID of the user',
        example: 'abcdef123456',
        type: String
    })
    id?: string;



    @ApiProperty({
        description: 'Titles of the media/ebooks that will be added to the section content.',
        example: ['mediatitle', 'ebooktitle'],
        type: [String],
    })
    @IsString({ each: true })
    assetsTitles?: string[];

}
