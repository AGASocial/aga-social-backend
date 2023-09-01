import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddSectionToCourseDto {
    @ApiProperty({
        description: 'Name of the course where the section will be added.',
        example: 'Programming Basics',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    courseId: string;

    @ApiProperty({
        description: 'Name of the section to be added to the course.',
        example: 'Introduction to Variables',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    sectionId: string;
}
