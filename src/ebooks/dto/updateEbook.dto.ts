import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsArray, IsDate, IsInt, IsEnum, IsBoolean } from "class-validator";
import { EbookFormat, EbookGenre } from 'src/ebooks/entities/ebooks.entity';

export class UpdateEbookDto {
    @ApiProperty({
        description: 'Title of the ebook',
        example: 'Introduction to Programming',
        type: String,
    })
    title?: string;

    @ApiProperty({
        description: 'Author/s of the ebook',
        example: ['John Smith', 'John Doe'],
        type: String,
    })
    author?: string[];

    @ApiProperty({
        description: 'URL to the ebook file',
        example: 'https://example.com/ebook.pdf',
        type: String,
    })
    url?: string;



    @ApiProperty({
        description: 'URL to the ebook title page file',
        example: 'https://example.com/ebook.pdf',
        type: String,
    })
    public titlePage?: string;

    @ApiProperty({
        description: 'Price of the ebook',
        example: 19.99,
        type: Number,
    })
    price?: number;

    @ApiProperty({
        description: 'Description of the ebook',
        example: 'A comprehensive guide to programming basics.',
        type: String,
    })
    description?: string;

    @ApiProperty({
        description: 'Release date of the ebook',
        example: '2023-08-01',
        type: Date,
    })
    releaseDate?: Date;

    @ApiProperty({
        description: 'Languages in which the ebook is available',
        example: ['English', 'Spanish'],
        type: [String],
    })
    language?: string[];

    @ApiProperty({
        description: 'Number of pages in the ebook (integer value)',
        example: 300,
        type: Number,
    })
    @IsInt()
    pageCount?: number;

    @ApiProperty({
        description: 'Genres of the ebook',
        example: [EbookGenre.ScienceFiction, EbookGenre.Technology],
        type: [String],
        enum: EbookGenre,
    })
    @IsEnum(EbookGenre, { each: true })
    genres?: EbookGenre[];


    @ApiProperty({
        description: 'Format of the ebook',
        example: 'PDF',
        enum: EbookFormat,
    })
    @IsEnum(EbookFormat)
    format?: EbookFormat;






    @ApiProperty({
        description: 'Status of the ebook, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    active?: boolean = true;


}
