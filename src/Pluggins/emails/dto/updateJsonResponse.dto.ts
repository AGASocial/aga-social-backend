import { IsNumber, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateJsonResponseDto {
    @IsNumber()
    @ApiProperty({ example: 200, description: 'HTTP status code' })
    statusCode: number;

    @IsString()
    @ApiProperty({ example: 'JSONUPDATEDSUCCESSFULLY', description: 'A message describing the response' })
    message: string;

    @IsObject()
    @ApiProperty({ example: { sectionName: 'updatedData' }, description: 'The data updated in the JSON' })
    data: any;

    constructor(statusCode: number, message: string, data: any) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}
