import { Controller, Post, Body, Param, Get, Put, Req, Delete } from '@nestjs/common';
import { CreateMediaDto } from './dto/createMedia.dto';
import { CreateMediaResponseDto } from './dto/createMediaResponse.dto';
import { DeleteMediaResponseDto } from './dto/deleteMediaResponse.dto';
import { GetMediaResponseDto } from './dto/getMediaResponse.dto';
import { UpdateMediaDto } from './dto/updateMedia.dto';
import { UpdateMediaResponseDto } from './dto/updateMediaResponse.dto';
import { MediaService } from './media.service';

@Controller()
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('firebase/media')
    async createNewMedia(@Body() createNewMediaDto: CreateMediaDto): Promise<CreateMediaResponseDto> {
        return this.mediaService.createNewMedia(createNewMediaDto);
    }



    @Put('firebase/media')      
    async updateMedia(@Body() updateMediaDto: Partial<UpdateMediaDto>): Promise<UpdateMediaResponseDto> {
        try {
            const url = updateMediaDto.url;
            const response = await this.mediaService.updateMedia(url, updateMediaDto);
            return response;
        } catch (error) {
            console.error('There was an error updating the media:', error);
            throw error;
        }
    }



    @Get('firebase/media')
    async getMedia(@Req() req: Request): Promise<GetMediaResponseDto> {

        return this.mediaService.getMedia();
    }

    //NOT IN USE
    @Delete('firebase/media/:title/:description')
    async deleteMedia(@Param('title') title: string, @Param('description') description: string, @Req() req: Request): Promise<DeleteMediaResponseDto> {

        return await this.mediaService.deleteMedia(title, description);
    }


    @Post('firebase/media/deactivate/:title')
    async deactivateMedia(@Param('title') title: string): Promise<DeleteMediaResponseDto> {
        return this.mediaService.deactivateMedia(title);
    }



    @Get('firebase/media/search-by-keywords')
    async getMediaByKeywords(@Body('keywords') keywords: string[]): Promise<GetMediaResponseDto> {
        const response = await this.mediaService.getMediaByKeywords(keywords);
        return response;
    }





}