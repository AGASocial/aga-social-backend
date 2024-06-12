import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsArray, IsDate, IsBoolean, IsOptional } from "class-validator";
import { Section } from "../../sections/entities/sections.entity";

export class UpdateCourseDto {
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
        description: 'Tags associated with the course',
        example: ['Web Development', 'HTML', 'CSS'],
        type: [String],
    })
    @IsOptional()
    public tags?: string[];

    @ApiProperty({
        description: 'Release date of the course',
        example: '2023-08-01',
        type: Date,
    })
    @IsOptional()
    public releaseDate?: Date;

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
    public offersCertificate?: boolean;



    @ApiProperty({
        description: 'URL to the course title page file',
        example: 'https://example.com/course.jpg',
        type: String,
    })
    @IsOptional()
    public titlePage?: string;

    @ApiProperty({
        description: 'Status of the course, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsOptional()
    active?: boolean = true;

   
}
