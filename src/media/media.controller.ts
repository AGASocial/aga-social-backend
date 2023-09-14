import { Controller, Post, Body, Param, Get, Put, Req, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMediaDto } from './dto/createMedia.dto';
import { CreateMediaResponseDto } from './dto/createMediaResponse.dto';
import { DeleteMediaResponseDto } from './dto/deleteMediaResponse.dto';
import { GetMediaResponseDto } from './dto/getMediaResponse.dto';
import { MediaType, UpdateMediaDto } from './dto/updateMedia.dto';
import { UpdateMediaResponseDto } from './dto/updateMediaResponse.dto';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';
import { FileFields } from 'formidable';
import { Readable } from 'stream';
import { UploadMediaResponseDto } from './dto/uploadMediaFileResponse.dto';
import { ApiBadRequestResponse, ApiBody, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMediaByIdResponseDto } from './dto/getMediaByIdResponse.dto';


@Controller()
@ApiTags('Media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }



    @Put('assets/media')
    @ApiOperation({ summary: 'Update media from Firebase' })
    @ApiBadRequestResponse({ description: 'Bad request. Check the parameters' })
    @ApiNotFoundResponse({ description: 'Media not found.' })
    async updateMedia(
        @Query('id') id: string,
        @Body() updateMediaDto: Partial<UpdateMediaDto>
    ): Promise<UpdateMediaResponseDto> {
        try {
            const response = await this.mediaService.updateMedia(id, updateMediaDto);
            return response;
        } catch (error) {
            console.error('There was an error updating the media:', error);
            throw error;
        }
    }


    @Get('assets/media')
    @ApiOperation({ summary: 'Retrieve all media from Firestore or retrieve the media that have the keywords on their title' })
    @ApiOkResponse({ description: 'Successfully retrieved media resources.', type: GetMediaResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
    async getMedia(
        @Query('keywords') keywords?: string[],
        @Query('id') id?: string
    ): Promise<GetMediaResponseDto | GetMediaByIdResponseDto> {
        if (keywords) {
            const response = await this.mediaService.getMediaByKeywords(keywords);
            return response;
        } else if (id) {
            const response = await this.mediaService.getMediaById(id);
            return response;

        }

        else {
            return this.mediaService.getMedia();
        }
    }


   
    @Post('assets/media')
    @ApiOperation({ summary: 'Uploads media to datastorage and creates the media on firestore using a dto' })
    @ApiBody({ description: 'Media file to be uploaded and media creation details' })
    @ApiResponse({ status: 200, description: 'The media file has been successfully uploaded and media created.', type: UploadMediaResponseDto })
    @ApiResponse({ status: 201, description: 'The media file has been successfully uploaded and media created.', type: CreateMediaResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request. Check the parameters being used' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadAndCreateMedia(
        @UploadedFile() file: any,
        @Body('publisher') publisher: string,
        @Body('type') type: MediaType,
        @Body('title') title: string,
        @Body('description') description: string,
        @Body('duration') duration: string,
        @Body('uploadDate') uploadDate: Date
    ): Promise<UploadMediaResponseDto | CreateMediaResponseDto> {
        try {
            const createNewMediaDto: CreateMediaDto = {
                publisher,
                type,
                title,
                description,
                duration,
                uploadDate
            };

            const result = await this.mediaService.uploadAndCreateMedia(file, createNewMediaDto);
            return result;
        } catch (error) {
            throw new Error(`Error uploading media or creating media: ${error.message}`);
        }
    }

    @ApiOperation({ summary: 'Register media file on Firestore. The media already exists on Youtube or Vimeo' })
    @ApiBadRequestResponse({ description: 'Invalid parameter/s' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('assets/media/users')
    async registerMedia(
        @Body() createMediaDto: any
    ): Promise<CreateMediaResponseDto> {
        try {

            await this.mediaService.registerMedia(
                createMediaDto.type,
                createMediaDto.title,
                createMediaDto.description,
                createMediaDto.duration,
                createMediaDto.publisher,
                createMediaDto.url,
                createMediaDto.uploadDate
            );

            const responseDto = new CreateMediaResponseDto(201, 'MEDIAUPLOADEDSUCCESSFULLY');
            return responseDto;
        } catch (error) {
            console.error('Error registering media:', error);
            throw error;
        }
    }
  




}