import { Controller, Post, Body, Put, Query, Get } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTagDto } from './dto/createTag.dto';
import { CreateTagResponseDto } from './dto/createTagResponse.dto';
import { GetTagsResponseDto } from './dto/getTags.dto';
import { UpdateTagDto } from './dto/updateTag.dto';
import { UpdateTagResponseDto } from './dto/updateTagResponse.dto';
import { TagsService } from './tags.service';




@ApiTags('Tags')
@Controller()
export class TagsController {
    constructor(private readonly tagService: TagsService) { }




    @Post('tags')

    @ApiOperation({ summary: 'Create a new tag and register it on Firestore using a DTO with its basic data' })
    @ApiBody({ description: 'Tag creation details', type: CreateTagDto })
    @ApiResponse({ status: 201, description: 'The tag has been successfully created.', type: CreateTagResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request. Check the parameters being used' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async createNewTag(@Body() createTagDto: CreateTagDto): Promise<CreateTagResponseDto> {
        try {
            return await this.tagService.createNewTag(createTagDto);
        } catch (error) {
            throw new Error(`Error creating a new tag: ${error.message}`);
        }
    }



    @Put('tags')
    @ApiOperation({ summary: 'Update tag information using a DTO with updated data' })
    @ApiBody({ description: 'Tag update details', type: UpdateTagDto })
    @ApiResponse({ status: 200, description: 'The tag information has been successfully updated.', type: UpdateTagResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request. Check the parameters being used' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
    async updateTag(@Query('id') id: string, @Body() updateTagDto: UpdateTagDto): Promise<UpdateTagResponseDto> {
        try {
            return await this.tagService.updateTag(id, updateTagDto);
        } catch (error) {
            throw new Error(`Error updating the tag: ${error.message}`);
        }
    }



    @Get('tags')
    @ApiOperation({ summary: 'Get tags associated with a user' })
    @ApiOkResponse({ description: 'Tags retrieved successfully', type: GetTagsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getTagsByUsername(@Query('username') username: string): Promise<GetTagsResponseDto> {
        try {
             return await this.tagService.getTagsByUsername(username);
        } catch (error) {
            throw new Error(`Error retrieving tags: ${error.message}`);
        }
    }




}
