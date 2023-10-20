import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsArray, IsDate, IsBoolean, IsInt} from "class-validator";
import { Section } from "../../sections/entities/sections.entity";

export class CreateCourseDto {
    @ApiProperty({
        description: 'Title of the course',
        example: 'Introduction to Web Development',
        type: String,
    })
    @IsNotEmpty({ message: 'Title is invalid' })
    @IsString({ message: 'Title is invalid' })
    public title: string;

    @ApiProperty({
        description: 'Description of the course',
        example: 'Learn the fundamentals of web development.',
        type: String,
    })
    @IsNotEmpty({ message: 'Description is invalid' })
    @IsString({ message: 'Description is invalid' })
    public description: string;

    @ApiProperty({
        description: 'Publisher of the course',
        example: 'Tech Publications',
        type: String,
    })
    @IsNotEmpty({ message: 'Publisher is invalid' })
    @IsString({ message: 'Publisher is invalid' })
    public publisher: string;

    @ApiProperty({
        description: 'Price of the course',
        example: 49.99,
        type: Number,
    })
    @IsNotEmpty({ message: 'Price is invalid' })
    @IsNumber({}, { message: 'Price is invalid' })
    public price: number;

    @ApiProperty({
        description: 'Sections included in the course',
        type: [Section],
    })
    public sections?: Section[];

    @ApiProperty({
        description: 'Tags associated with the course',
        example: ['Web Development', 'HTML', 'CSS'],
        type: [String],
    })
    @IsNotEmpty({ message: 'Tags are invalid' })
    @IsArray({ message: 'Tags are invalid' })
    @IsString({ each: true, message: 'Each tag is invalid' })
    public tags: string[];

    @ApiProperty({
        description: 'Release date of the course',
        example: '2023-08-01',
        type: Date,
    })
    @IsNotEmpty({ message: 'Release date is invalid' })
    public releaseDate: Date;

    @ApiProperty({
        description: 'List of instructors for the course',
        example: ['John Smith', 'Jane Doe'],
        type: [String],
    })
    @IsNotEmpty({ message: 'Instructor list is invalid' })
    @IsArray({ message: 'Instructor list is invalid' })
    @IsString({ each: true, message: 'Each instructor is invalid' })
    public instructorList: string[];

    @ApiProperty({
        description: 'Language of the course',
        example: 'English',
        type: String,
    })
    @IsNotEmpty({ message: 'Language is invalid' })
    @IsString({ message: 'Language is invalid' })
    public language: string;

    @ApiProperty({
        description: 'Indicates if the course offers a certificate',
        example: true,
        type: Boolean,
    })
    @IsNotEmpty({ message: 'Offers certificate is invalid' })
    @IsBoolean({ message: 'Offers certificate is invalid' })
    public offersCertificate: boolean;

    @ApiProperty({
        description: 'Number of sales for the course, default is 0',
        example: 100,
        type: Number,
    })
    @IsInt({ message: 'Sales count must be an integer' })
    @IsNotEmpty({ message: 'Sales count is invalid' })
    @IsNumber({}, { message: 'Sales count is invalid' })
    salesCount: number = 0;

    @ApiProperty({
        description: 'URL to the ebook title page file',
        example: 'https://example.com/ebook.pdf',
        type: String,
    })
    @IsNotEmpty({ message: 'Title page URL is invalid' })
    @IsString({ message: 'Title page URL is invalid' })
    public titlePage: string;

    @ApiProperty({
        description: 'Firestore ID of the user',
        example: 'abcdef123456',
        type: String
    })
    id?: string;

    @ApiProperty({
        description: 'Section names that will be associated with the course',
        example: ['Section1', 'Section2'],
        type: [String],
    })
    @IsString({ each: true, message: 'Each section ID is invalid' })
    public sectionsIds?: string[];
}
