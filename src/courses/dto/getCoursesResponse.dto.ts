import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";
import { DocResult } from "../../utils/docResult.entity";
import { Course } from "../entities/course.entity";

export class GetCoursesResponseDto {

    @ApiProperty({
        description: 'HTTP response status code',
        default: 201,
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, should return "COURSESRETRIEVEDSUCCESSFULLY"',
        default: 'COURSESRETRIEVEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;


    @ApiProperty({
        description: 'Profile Picture of the publisher of the course',
        type: String,
    })
    public userPicture?: string;



    @ApiProperty({
        description: 'Array containing the info of every course found'
    })
    public coursesFound: DocResult[] | Course[]



    constructor(statusCode: number, message: string, coursesFound: DocResult[] | Course[]) {
        this.statusCode = statusCode;
        this.message = message;
        this.coursesFound = coursesFound;


    }
}
