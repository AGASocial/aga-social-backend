import { Controller, Post, Body, Param, Get, Put, Req, Delete, UseInterceptors, UploadedFile, Query, Patch, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMediaDto } from './dto/createMedia.dto';
import { CreateMediaResponseDto } from './dto/createMediaResponse.dto';
import { GetMediaResponseDto } from './dto/getMediaResponse.dto';
import { MediaType, UpdateMediaDto } from './dto/updateMedia.dto';
import { UpdateMediaResponseDto } from './dto/updateMediaResponse.dto';
import { MediaService } from './media.service';
import { UploadMediaResponseDto } from './dto/uploadMediaFileResponse.dto';
import { ApiBadRequestResponse, ApiBody, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMediaByIdResponseDto } from './dto/getMediaByIdResponse.dto';
import { Response } from "express";



@Controller()
@ApiTags('Media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }



    @ApiTags('Media')
    @ApiBody({ type: UpdateMediaDto })
    @ApiOperation({ summary: 'Update media from Firebase' })
    @ApiOkResponse({ description: 'Media updated successfully', type: UpdateMediaResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Check the parameters' })
    @ApiNotFoundResponse({ description: 'Media not found' })
    @ApiParam({ name: 'mediaId', description: 'ID of the media', type: 'string', example: 'H01GHPOJLmVEXJ5gclc2' })
    @Patch('assets/media/:mediaId')
    async updateMedia(
        @Body() updateMediaDto: Partial<UpdateMediaDto>,
        @Res() res: Response,
        @Param('mediaId') mediaId: string
    ): Promise<void> {
        try {

            const response: UpdateMediaResponseDto = await this.mediaService.updateMedia(mediaId, updateMediaDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('There was an error updating the media:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to update the media',
                data: {},
            });
        }
    }



    @ApiTags('Media')
    @ApiOperation({ summary: 'Retrieve all media from Firestore or retrieve the media that have keywords in their title' })
    @ApiOkResponse({ description: 'Successfully retrieved media resources.', type: GetMediaResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiQuery({ name: 'keywords', type: [String], isArray: true, required: false })
    @Get('assets/media')
    async getMedia(
        @Res() res: Response,
        @Query('keywords') keywords?: string[],
    ): Promise<void> {
        try {
            let response: GetMediaResponseDto;

            if (keywords) {
                response = await this.mediaService.getMediaByKeywords(keywords);
            } else {
                response = await this.mediaService.getMedia();
            }

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error retrieving media resources:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to retrieve the media',
                data: {},
            });
        }
    }


    @ApiTags('Media')
    @ApiOperation({ summary: 'Get a media resource by ID' })
    @ApiOkResponse({ description: 'Media resource retrieved successfully', type: GetMediaByIdResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or media not found' })
    @ApiParam({ name: 'mediaId', description: 'ID of the media', type: 'string', example: 'H01GHPOJLmVEXJ5gclc2' })
    @Get('assets/media/:mediaId')
    async getMediaById(
        @Res() res: Response,
        @Param('mediaId') mediaId: string
    ): Promise<void> {
        try {
            const response: GetMediaByIdResponseDto = await this.mediaService.getMediaById(mediaId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error retrieving media resource:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to retrieve media resource',
                data: {},
            });
        }
    }



   
    @ApiTags('Media')
    @ApiOperation({ summary: 'Upload and create media' })
    @ApiOkResponse({ description: 'Media uploaded and created successfully', type: UploadMediaResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to upload media' })
    @UseInterceptors(FileInterceptor('file'))
    @Post('assets/media')
    async uploadAndCreateMedia(
        @Res() res: Response,
        @UploadedFile() file: any,
        @Body('publisher') publisher: string,
        @Body('type') type: MediaType,
        @Body('title') title: string,
        @Body('description') description: string,
        @Body('duration') duration: string,
        @Body('uploadDate') uploadDate: Date
    ): Promise<void> {
        try {
            const createNewMediaDto: CreateMediaDto = {
                publisher,
                type,
                title,
                description,
                duration,
                uploadDate
            };

            const response: UploadMediaResponseDto | CreateMediaResponseDto = await this.mediaService.uploadAndCreateMedia(file, createNewMediaDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error uploading and creating media:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to create media resource',
                data: {},
            });
        }
    }


    @ApiTags('Media')
    @ApiBody({ type: CreateMediaDto })
    @ApiOperation({ summary: 'Register media' })
    @ApiOkResponse({ description: 'Media registered successfully', type: CreateMediaResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to register media' })
    @Post('assets/media/users')
    async registerMedia(
        @Res() res: Response,
        @Body() createMediaDto: CreateMediaDto):
        Promise<void> {
        try {
            const response: CreateMediaResponseDto = await this.mediaService.registerMedia(
                createMediaDto.type,
                createMediaDto.title,
                createMediaDto.description,
                createMediaDto.duration,
                createMediaDto.publisher,
                createMediaDto.url,
                createMediaDto.uploadDate
            );

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error registering media:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to register media',
                data: {},
            });
        }
    }





}