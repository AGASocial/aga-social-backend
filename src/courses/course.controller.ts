import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/createCourse.dto";
import { CreateCourseResponseDto } from "./dto/createCourseResponse.dto";
import { DeleteCourseResponseDto } from "./dto/deleteCourseResponse.dto";
import { GetCoursesResponseDto } from "./dto/getCoursesResponse.dto";
import { UpdateCourseDto } from "./dto/updateCourse.dto";
import { UpdateCourseResponseDto } from "./dto/updateCourseResponse.dto";


@Controller()
export class CourseController {
    constructor(private readonly courseService: CourseService) { }

    @Post('firebase/courses')
    async createNewCourse(@Body() createNewCourseDto: CreateCourseDto): Promise<CreateCourseResponseDto> {
        return this.courseService.createNewCourse(createNewCourseDto);
    }


    @Put('firebase/courses/:title')
    async updateCourses(@Param('title') title: string, @Body() updateCourseDto: Partial<UpdateCourseDto>, @Req() req: Request): Promise<UpdateCourseResponseDto> {

        return await this.courseService.updateCourse(title, updateCourseDto);
    }


    @Delete('firebase/courses/:title')
    async deleteCourse(@Param('title') title: string, @Req() req: Request): Promise<DeleteCourseResponseDto> {

        return await this.courseService.deleteCourse(title);
    }


    @Get('firebase/courses')
    async getCourses(@Req() req: Request): Promise<GetCoursesResponseDto> {

        return this.courseService.getCourses();
    }


}