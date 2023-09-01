import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";

export class CreateCourseResponseDto {

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
        description: 'Descriptive response message, should return "COURSECREATEDSUCCESSFULLY"',
        default: 'COURSECREATEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;


    @ApiProperty({
        description: 'ID of the created role',
        type: String
    })
    public courseId?: string;



    constructor(statusCode: number, message: string, courseId: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.courseId = courseId;
    }
}
