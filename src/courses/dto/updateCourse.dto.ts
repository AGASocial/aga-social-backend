import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsArray, IsDate, IsBoolean } from "class-validator";
import { Section } from "../../sections/entities/sections.entity";

export class UpdateCourseDto {
    @ApiProperty({
        description: 'Title of the course',
        example: 'Introduction to Web Development',
        type: String,
    })
    @IsString()
    public title?: string;

    @ApiProperty({
        description: 'Description of the course',
        example: 'Learn the fundamentals of web development.',
        type: String,
    })
    @IsString()
    public description?: string;

    @ApiProperty({
        description: 'Publisher of the course',
        example: 'Tech Publications',
        type: String,
    })
    @IsString()
    public publisher?: string;

    @ApiProperty({
        description: 'Price of the course',
        example: 49.99,
        type: Number,
    })
    @IsNumber()
    public price?: number;


    @ApiProperty({
        description: 'Tags associated with the course',
        example: ['Web Development', 'HTML', 'CSS'],
        type: [String],
    })
    public tags?: string[];

    @ApiProperty({
        description: 'Release date of the course',
        example: '2023-08-01',
        type: Date,
    })

    public releaseDate?: Date;

    @ApiProperty({
        description: 'List of instructors for the course',
        example: ['John Smith', 'Jane Doe'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    public instructorList?: string[];

    @ApiProperty({
        description: 'Language of the course',
        example: 'English',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public language?: string;

    @ApiProperty({
        description: 'Indicates if the course offers a certificate',
        example: true,
        type: Boolean,
    })
    @IsBoolean()
    public offersCertificate?: boolean;



    @ApiProperty({
        description: 'URL to the course title page file',
        example: 'https://example.com/course.jpg',
        type: String,
    })
    @IsString()
    public titlePage?: string;

    @ApiProperty({
        description: 'Status of the course, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    active?: boolean = true;

}
