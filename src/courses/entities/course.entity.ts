import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsArray, IsDate, IsBoolean } from "class-validator";
import { Section } from "../../sections/entities/sections.entity";

export class Course {
    @ApiProperty({
        description: 'Title of the course',
        example: 'Introduction to Web Development',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public title: string;

    @ApiProperty({
        description: 'Description of the course',
        example: 'Learn the fundamentals of web development.',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public description: string;

    @ApiProperty({
        description: 'Publisher of the course',
        example: 'Tech Publications',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public publisher: string;

    @ApiProperty({
        description: 'Price of the course',
        example: 49.99,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    public price: number;

    @ApiProperty({
        description: 'Sections included in the course',
        type: [Section],
    })
    @IsNotEmpty()
    @IsArray()
    public sections: Section[];

    @ApiProperty({
        description: 'Tags associated with the course',
        example: ['Web Development', 'HTML', 'CSS'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    public tags: string[];

    @ApiProperty({
        description: 'Release date of the course',
        example: '2023-08-01',
        type: Date,
    })
    @IsNotEmpty()
    public releaseDate: Date;

    @ApiProperty({
        description: 'List of instructors for the course',
        example: ['John Smith', 'Jane Doe'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    public instructorList: string[];

    @ApiProperty({
        description: 'Language of the course',
        example: 'English',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public language: string;

    @ApiProperty({
        description: 'Indicates if the course offers a certificate',
        example: true,
        type: Boolean,
    })
    @IsNotEmpty()
    @IsBoolean()
    public offersCertificate: boolean;
}
