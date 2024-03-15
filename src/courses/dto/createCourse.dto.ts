import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsArray, IsDate, IsBoolean, IsInt, IsOptional} from "class-validator";
import { Section } from "../../sections/entities/sections.entity";

export class CreateCourseDto {
    @ApiProperty({
        description: 'Title of the course',
        example: 'Introduction to Web Development',
        type: String,
    })
    @IsOptional()
    public title?: string;

    @ApiProperty({
        description: 'Description of the course',
        example: 'Learn the fundamentals of web development.',
        type: String,
    })
    @IsOptional()
    public description?: string;

    @ApiProperty({
        description: 'Publisher of the course',
        example: 'prueba11111',
        type: String,
    })
    @IsOptional()
    public publisher?: string;

    @ApiProperty({
        description: 'Price of the course',
        example: 49.99,
        type: Number,
    })
    @IsOptional()
    public price?: number;

    @ApiProperty({
        description: 'Sections included in the course',
        type: [Section],
    })
    @IsOptional()
    public sections?: Section[];

    @ApiProperty({
        description: 'Tags associated with the course',
        example: ['Web Development', 'HTML', 'CSS'],
        type: [String],
    })
    @IsOptional()
    public tags: string[];

    @ApiProperty({
        description: 'Release date of the course',
        example: '2023-08-01',
        type: Date,
    })
    @IsOptional()
    public releaseDate: Date;

    @ApiProperty({
        description: 'List of instructors for the course',
        example: ['John Smith', 'Jane Doe'],
        type: [String],
    })
    @IsOptional()
    public instructorList?: string[];

    @ApiProperty({
        description: 'Language of the course',
        example: 'English',
        type: String,
    })
    @IsOptional()
    public language?: string;

    @ApiProperty({
        description: 'Indicates if the course offers a certificate',
        example: true,
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean({ message: 'Offers certificate is invalid' })
    public offersCertificate?: boolean;

   
    @ApiProperty({
        description: 'URL to the ebook title page file',
        example: 'https://example.com/ebook.pdf',
        type: String,
    })
    @IsOptional()
    public titlePage?: string;


    @ApiProperty({
        description: 'Section names that will be associated with the course',
        example: ['ce36e9d5-da3b-461d-9c53-8b3d26b37474'],
        type: [String],
    })
    @IsOptional()
    public sectionsIds?: string[];
}
