import { Controller, Post, Body, Put, Query, Get, Param, Res, Patch } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTagDto } from './dto/createTag.dto';
import { CreateTagResponseDto } from './dto/createTagResponse.dto';
import { GetTagsResponseDto } from './dto/getTags.dto';
import { UpdateTagDto } from './dto/updateTag.dto';
import { UpdateTagResponseDto } from './dto/updateTagResponse.dto';
import { TagsService } from './tags.service';
import { Response } from "express";




@ApiTags('Tags')
@Controller()
export class TagsController {
    constructor(private readonly tagService: TagsService) { }




    @ApiTags('Tags')
    @ApiOperation({ summary: 'Create a new tag' })
    @ApiBody({ type: CreateTagDto })
    @ApiOkResponse({ description: 'Tag created successfully', type: CreateTagResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @Post('tags')
    async createNewTag(
        @Res() res: Response,
        @Body() createTagDto: CreateTagDto,
    ): Promise<void> {
        try {
            const response: CreateTagResponseDto = await this.tagService.createNewTag(createTagDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error creating a new tag:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to create a new tag',
                data: {},
            });
        }
    }



    @ApiTags('Tags')
    @ApiOperation({ summary: 'Update a tag' })
    @ApiParam({ name: 'id', description: 'ID of the tag', type: 'string', example: '5AGdF617CVpLyGeZerwa' })
    @ApiBody({ type: UpdateTagDto })
    @ApiOkResponse({ description: 'Tag updated successfully', type: UpdateTagResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @Patch('tags/:id')
    async updateTag(
        @Res() res: Response,
        @Param('id') id: string,
        @Body() updateTagDto: Partial<UpdateTagDto>,
    ): Promise<void> {
        try {
            const response: UpdateTagResponseDto = await this.tagService.updateTag(id, updateTagDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error updating the tag:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to update the tag',
                data: {},
            });
        }
    }



    @ApiTags('Users')
    @ApiOperation({ summary: 'Get tags associated with a user' })
    @ApiOkResponse({ description: 'Tags retrieved successfully', type: GetTagsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiParam({ name: 'userId', description: 'ID of the user', type: 'string', example: 'FEXCjqRy6ga2Ioc7n3tS6MpydcZ2' })
    @Get('users/:userId/tags')
    async getTagsById(
        @Res() res: Response,
        @Param('userId')  userId: string,
    ): Promise<void> {
        try {
            const response: GetTagsResponseDto = await this.tagService.getTagsById(userId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error retrieving tags:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve tags',
                data: {},
            });
        }
    }



}
