import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CourseService } from "./course.service";
import { AddSectionToCourseResponseDto } from "./dto/addSectionToCourseResponse.dto";
import { CreateCourseDto } from "./dto/createCourse.dto";
import { CreateCourseResponseDto } from "./dto/createCourseResponse.dto";
import { GetCoursesResponseDto } from "./dto/getCoursesResponse.dto";
import { PurchaseCourseDto } from "./dto/purchaseCourse.dto";
import { PurchaseCourseResponseDto } from "./dto/purchaseCourseResponse.dto";
import { UpdateCourseDto } from "./dto/updateCourse.dto";
import { UpdateCourseResponseDto } from "./dto/updateCourseResponse.dto";
import { Response } from "express";


@Controller()
@ApiTags('Courses')
export class CourseController {
    constructor(private readonly courseService: CourseService) { }



    
    @ApiTags('Courses')
    @ApiOperation({ summary: 'Get purchased courses for a user' })
    @ApiOkResponse({ description: 'Purchased courses retrieved successfully', type: GetCoursesResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to retrieve purchased courses' })
    @ApiParam({ name: 'userId', description: 'ID of the user', type: 'string', example: '0EwINikFVAg7jtRdkZYiTBXN4vW2' })
    @Get('users/:userId/courses')
    async getPurchasedCourses(
        @Param('userId') userId: string,
        @Res() res: Response
    ): Promise<void> {
        try {
            const result: GetCoursesResponseDto = await this.courseService.getPurchasedCourses(userId);

            res.status(result.code).send({
                status: result.status,
                code: result.code,
                message: result.message,
                data: result.data.result,
            });

        } catch (error) {
            console.error('Error retrieving purchased courses:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to retrieve purchased courses',
                data: {},
            });
        }
    }




    @ApiTags('Courses')
    @ApiBody({ type: UpdateCourseDto })
    @ApiParam({ name: 'courseId', description: 'ID of course', type: 'string', example: 'gWojVo5I8rjDnHgcggWH' })
    @ApiOperation({ summary: 'Update a course' })
    @ApiOkResponse({ description: 'Course updated successfully', type: UpdateCourseResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or course not found' })
    @Patch('assets/courses/:courseId')
    async updateCourse(
        @Body() updateCourseDto: Partial<UpdateCourseDto>,
        @Res() res: Response,
        @Param('courseId') courseId: string
    ): Promise<void> {
        try {
            const updateCourseResponse: UpdateCourseResponseDto = await this.courseService.updateCourse(courseId, updateCourseDto);

            res.status(updateCourseResponse.code).send({
                status: updateCourseResponse.status,
                code: updateCourseResponse.code,
                message: updateCourseResponse.message,
                data: updateCourseResponse.data.result,
            });

        } catch (error) {
            console.error('Error updating course:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to update course',
                data: {},
            });
        }
    }



    @ApiTags('Courses')
    @ApiOperation({ summary: 'Get list of all courses, or get a list of courses that have certain tags, or get a list of courses that have certain keywords on their titles' })
    @ApiOkResponse({ description: 'Courses retrieved successfully', type: GetCoursesResponseDto })
    @Get('assets/courses')
    async getCourses(
        @Res() res: Response,
        @Query('keywords') keywords?: string[],
        @Query('tags') tags?: string[]
    ): Promise<void> {
        try {
            let response: GetCoursesResponseDto;

            if (keywords) {
                response = await this.courseService.getCoursesByKeywords(keywords);
            } else if (tags) {
                response = await this.courseService.getCoursesByTags(tags);
            } else {
                response = await this.courseService.getCourses();
            }

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error retrieving courses:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'There was an error retrieving the courses.',
                data: {},
            });
        }
    }


   
    @ApiTags('Courses')
    @ApiOperation({ summary: 'Get a course by ID' })
    @ApiOkResponse({ description: 'Course retrieved successfully', type: GetCoursesResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or course not found' })
    @ApiParam({ name: 'courseId', description: 'ID of the course', type: 'string', example: 'gWojVo5I8rjDnHgcggWH' })
    @Get('assets/courses/:courseId')
    async getCourseById(
        @Param('courseId') courseId: string,
        @Res() res: Response
    ): Promise<void> {
        try {
            const response: GetCoursesResponseDto = await this.courseService.getCourseById(courseId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error retrieving course by ID:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to retrieve course by ID',
                data: {},
            });
        }
    }




    @ApiTags('Courses')
    @ApiOperation({ summary: 'Add a section to a course' })
    @ApiParam({ name: 'courseId', description: 'ID of the course', type: 'string', example: 'gWojVo5I8rjDnHgcggWH' })
    @ApiParam({ name: 'sectionId', description: 'ID of the section', type: 'string', example: '2ef110f6-42c8-4784-99ba-6c5b850a2f8f' })
    @ApiOkResponse({ description: 'Section added to the course successfully', type: AddSectionToCourseResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or course not found' })
    @Patch('assets/courses/:courseId/sections/:sectionId')
    async addSectionToCourse(
        @Param('courseId') courseId: string,
        @Param('sectionId') sectionId: string,
        @Res() res: Response
    ): Promise<void> {
        try {
            const response: AddSectionToCourseResponseDto = await this.courseService.addSectionToCourse(courseId, sectionId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error adding section to course:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to add section to course',
                data: {},
            });
        }
    }



   
    @ApiTags('Courses')
    @ApiOperation({ summary: 'Create and upload a new course' })
    @ApiBody({ type: CreateCourseDto })
    @ApiOkResponse({ description: 'Course created and uploaded successfully', type: CreateCourseResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to create/upload course' })
    @Post('assets/courses')
    async createAndUploadCourse(
        @Body() createNewCourseDto: CreateCourseDto,
        @Res() res: Response
    ): Promise<void> {
        try {
            const response: CreateCourseResponseDto = await this.courseService.createAndUploadCourse(createNewCourseDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error creating/uploading course:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to create/upload course',
                data: {},
            });
        }
    }




  
    @ApiTags('Courses')
    @ApiOperation({ summary: 'Purchase a course' })
    @ApiBody({ type: PurchaseCourseDto })
    @ApiOkResponse({ description: 'Course purchased successfully', type: PurchaseCourseResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to purchase course' })
    @Post('purchase/course')
    async purchaseCourse(
        @Body() purchaseCourseDto: PurchaseCourseDto,
        @Res() res: Response
    ): Promise<void> {
        try {
            const { userId, courseId, paymentIntentId } = purchaseCourseDto;

            const response: PurchaseCourseResponseDto = await this.courseService.purchaseCourse(userId, courseId, paymentIntentId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error purchasing course:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to purchase course',
                data: {},
            });
        }
    }





}