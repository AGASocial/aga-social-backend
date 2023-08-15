import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsArray, IsDate, IsInt, IsEnum } from "class-validator";
import { EbookFormat, EbookGenre } from "../entities/ebooks.entity";

export class CreateEbookDto {
    @ApiProperty({
        description: 'Title of the ebook',
        example: 'Introduction to Programming',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    title: string;


    @ApiProperty({
        description: 'Publisher of the ebook',
        example: 'Pepito Perez',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public publisher: string;



    @ApiProperty({
        description: 'Author/s of the ebook',
        example: ['John Smith', 'John Doe'],
        type: String,
    })
    @IsNotEmpty()
    @IsString({ each: true })
    author: string[];

    @ApiProperty({
        description: 'URL to the ebook file',
        example: 'https://example.com/ebook.pdf',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    url: string;



    @ApiProperty({
        description: 'URL to the ebook title page file',
        example: 'https://example.com/ebook.pdf',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public titlePage: string;

    @ApiProperty({
        description: 'Price of the ebook',
        example: 19.99,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({
        description: 'Description of the ebook',
        example: 'A comprehensive guide to programming basics.',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Release date of the ebook',
        example: '2023-08-01',
        type: Date,
    })
    @IsNotEmpty()
    releaseDate: Date;

    @ApiProperty({
        description: 'Languages in which the ebook is available',
        example: ['English', 'Spanish'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    language: string[];

    @ApiProperty({
        description: 'Number of pages in the ebook (integer value)',
        example: 300,
        type: Number,
    })
    @IsNotEmpty()
    @IsInt()
    pageCount: number;

    @ApiProperty({
        description: 'Genres of the ebook',
        example: [EbookGenre.ScienceFiction, EbookGenre.Technology],
        type: [String],
        enum: EbookGenre,
    })
    @IsNotEmpty()
    @IsArray()
    @IsEnum(EbookGenre, { each: true })
    genres: EbookGenre[];


    @ApiProperty({
        description: 'Format of the ebook',
        example: 'PDF',
        enum: EbookFormat,
    })
    @IsNotEmpty()
    @IsEnum(EbookFormat)
    format: EbookFormat;


    @ApiProperty({
        description: 'Number of sales for the ebook, default is 0',
        example: 100,
        type: Number,
    })
    @IsInt()
    @IsNotEmpty()
    @IsNumber()
    salesCount: number = 0;
  

}
