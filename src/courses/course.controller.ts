import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CourseService } from "./course.service";
import { AddSectionToCourseDto } from "./dto/addSectionToCourse.dto";
import { AddSectionToCourseResponseDto } from "./dto/addSectionToCourseResponse.dto";
import { CreateCourseDto } from "./dto/createCourse.dto";
import { CreateCourseResponseDto } from "./dto/createCourseResponse.dto";
import { GetCoursesResponseDto } from "./dto/getCoursesResponse.dto";
import { UpdateCourseDto } from "./dto/updateCourse.dto";
import { UpdateCourseResponseDto } from "./dto/updateCourseResponse.dto";


@Controller()
@ApiTags('Courses')
export class CourseController {
    constructor(private readonly courseService: CourseService) { }



    /*
    @ApiOperation({ summary: 'Create a new course on Firestore' })
    @ApiCreatedResponse({ description: 'Course created successfully', type: CreateCourseResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid input' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('assets/courses')
    async createNewCourse(@Body() createNewCourseDto: CreateCourseDto): Promise<CreateCourseResponseDto> {
        return this.courseService.createNewCourse(createNewCourseDto);
    }*/



    @ApiOperation({ summary: 'Update a course' })
    @ApiOkResponse({ description: 'Course updated successfully', type: UpdateCourseResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid input, check the parameters' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Put('assets/courses')
    async updateCourses(
        @Query('id') id: string,
        @Body() updateCourseDto: Partial<UpdateCourseDto>,
        @Req() req: Request
    ): Promise<UpdateCourseResponseDto> {
        return await this.courseService.updateCourse(id, updateCourseDto);
    }


    @ApiOperation({ summary: 'Get list of all courses, or get a list of courses that have certain tags, or get a list of courses that have certain keywords on their titles' })
    @ApiOkResponse({ description: 'Courses retrieved successfully', type: GetCoursesResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('assets/courses')
    async getCourses(
        @Query('keywords') keywords?: string[],
        @Query('tags') tags?: string[]
    ): Promise<GetCoursesResponseDto> {
        if (keywords) {
            const response = await this.courseService.getCoursesByKeywords(keywords);
            return response;
        } else if (tags) {
            return await this.courseService.getCoursesByTags(tags);
        } else {
            return this.courseService.getCourses();
        }
    }



    @ApiOperation({ summary: 'Add a section to a course' })
    @ApiOkResponse({ description: 'Section added successfully', type: AddSectionToCourseResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('assets/courses/sections')
    async addSectionToCourse(@Body() addSectionToCourseDto: AddSectionToCourseDto): Promise<AddSectionToCourseResponseDto> {
        try {
            const response = await this.courseService.addSectionToCourse(addSectionToCourseDto);
            return response;
        } catch (error) {
            throw error;
        }
    }




    @ApiOperation({ summary: 'Create and upload a course' })
    @ApiOkResponse({ description: 'Course created and uploaded successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('assets/courses')
    async createAndUploadCourse(@Body() createNewCourseDto: CreateCourseDto) {
        try {
            const response = await this.courseService.createAndUploadCourse(createNewCourseDto);
            return response;
        } catch (error) {
            throw error;
        }
    }



}