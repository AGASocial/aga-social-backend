import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";
import { DocResult } from "../../utils/docResult.entity";
import { Course } from "../entities/course.entity";

export class GetCoursesResponseDto {
    @ApiProperty({
        example: 'success',
        description: 'Response status.'
    })
    status: string;

    @ApiProperty({
        example: 200,
        description: 'Response code.'
    })
    code: number;

    @ApiProperty({
        example: 'Request successfully processed.',
        description: 'Response message.'
    })
    message: string;

    @ApiProperty({
        type: 'object',
        description: 'Response data, contains the result.'
    })
    data: {
        result: Record<string, any>;
    };

    constructor(status: string, code: number, message: string, result: Record<string, any>) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.data = {
            result: result
        };
    }

}