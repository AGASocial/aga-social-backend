import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsArray, IsDate, IsInt, IsEnum, IsBoolean } from "class-validator";


export enum EbookFormat {
    PDF = 'PDF',
    EPUB = 'EPUB',
    MOBI = 'MOBI',
    AZW3 = 'AZW3',
    DOCX = 'DOCX',
}



export enum EbookGenre {
    ScienceFiction = 'Science Fiction',
    Fantasy = 'Fantasy',
    Mystery = 'Mystery',
    Romance = 'Romance',
    Thriller = 'Thriller',
    Horror = 'Horror',
    NonFiction = 'Non-Fiction',
    SelfHelp = 'Self-Help',
    History = 'History',
    Biography = 'Biography',
    Business = 'Business',
    Science = 'Science',
    Technology = 'Technology',
    Cooking = 'Cooking',
    Travel = 'Travel',
    Education = 'Education',
    Mathematics = 'Mathematics',
    Philosophy = 'Philosophy',
    Psychology = 'Psychology',
    Literature = 'Literature',
    Linguistics = 'Linguistics',
    Sociology = 'Sociology',
    PoliticalScience = 'Political Science',
    Economics = 'Economics',
    Law = 'Law',
    Medicine = 'Medicine',
    ComputerScience = 'Computer Science',
    Design = 'Design',
    Engineering = 'Engineering',
    EnvironmentalScience = 'Environmental Science',
    FineArts = 'Fine Arts',
    Music = 'Music',
    PerformingArts = 'Performing Arts',
    ReligiousStudies = 'Religious Studies',
    Sports = 'Sports',
    Nutrition = 'Nutrition',
    Languages = 'Languages',
    CareerDevelopment = 'Career Development',
    PersonalFinance = 'Personal Finance',
}



export class Ebook {
    @ApiProperty({
        description: 'Title of the ebook',
        example: 'Introduction to Programming',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public title: string;



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
   public author: string[];

    @ApiProperty({
        description: 'URL to the ebook file',
        example: 'https://example.com/ebook.pdf',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public url: string;



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
   public price: number;

    @ApiProperty({
        description: 'Description of the ebook',
        example: 'A comprehensive guide to programming basics.',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public description: string;

    @ApiProperty({
        description: 'Release date of the ebook',
        example: '2023-08-01',
        type: Date,
    })
    @IsNotEmpty()
   public releaseDate: Date;

    @ApiProperty({
        description: 'Languages in which the ebook is available',
        example: ['English', 'Spanish'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    public language: string[];

    @ApiProperty({
        description: 'Number of pages in the ebook (integer value)',
        example: 300,
        type: Number,
    })
    @IsNotEmpty()
    @IsInt()
   public  pageCount: number;

    @ApiProperty({
        description: 'Genres of the ebook',
        example: [EbookGenre.ScienceFiction, EbookGenre.Technology],
        type: [String],
        enum: EbookGenre,
    })
    @IsNotEmpty()
    @IsArray()
    @IsEnum(EbookGenre, { each: true })
   public genres: EbookGenre[];

    @ApiProperty({
        description: 'Format of the ebook',
        example: 'PDF',
        enum: EbookFormat,
    })
    @IsNotEmpty()
    @IsEnum(EbookFormat)
   public format: EbookFormat;




    @ApiProperty({
        description: 'Number of sales for the ebook, default is 0',
        example: 100,
        type: Number,
    })
    @IsInt()
    @IsNotEmpty()
    @IsNumber()
    public salesCount: number = 0;


    @ApiProperty({
        description: 'Status of the ebook, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    isActive?: boolean = true;

}
