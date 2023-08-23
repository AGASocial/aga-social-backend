import { Controller, Post, Body, Param, Get, Put, Req, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { CreateEbookDto } from './dto/createEbook.dto';
import { CreateEbookResponseDto } from './dto/createEbookResponse.dto';
import { DeleteEbookDto } from './dto/deleteEbook.dto';
import { DeleteEbookResponseDto } from './dto/deleteEbookResponse.dto';
import { GetEbooksResponseDto } from './dto/getEbooksResponse.dto';
import { UpdateEbookDto } from './dto/updateEbook.dto';
import { UpdateEbookResponseDto } from './dto/updateEbookResponse.dto';
import { EbookService } from './ebooks.service';
import { EbookFormat, EbookGenre } from './entities/ebooks.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadEbookResponseDto } from './dto/uploadEbookResponse.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';



@Controller()
@ApiTags('Ebooks')
export class EbookController {
    constructor(private readonly ebookService: EbookService) { }



    //UPLOADS THE FILE TO DATASTORAGE AND REGISTERS THE FILE IN FIRESTORE
    @ApiOperation({ summary: 'Upload to Datastorage and create an ebook on Firestore' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('assets/ebooks')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAndCreateEbook(
        @UploadedFile() file: any,
        @Body('titlePage') titlePage: string,
        @Body('title') title: string,
        @Body('description') description: string,
        @Body('author') author: string[],
        @Body('releaseDate') releaseDate: Date,
        @Body('price') price: number,
        @Body('language') language: string[],
        @Body('pageCount') pageCount: number,
        @Body('genres') genres: EbookGenre[],
        @Body('format') format: EbookFormat,
        @Body('publisher') publisher: string,
    ): Promise<UploadEbookResponseDto> {
        try {
            const createNewEbookDto: CreateEbookDto = {
                title,
                description,
                titlePage
                , author,
                releaseDate,
                price,
                language,
                pageCount,
                genres,
                format,
                publisher,
            };

            const result = await this.ebookService.uploadAndCreateEbook(file, createNewEbookDto);
            return result;
        } catch (error) {
            throw new Error(`Error uploading media or creating ebook: ${error.message}`);
        }
    }







    @ApiOperation({ summary: 'Update an ebook registered on Firestore' })
    @ApiBadRequestResponse({ description: 'Bad request. Check the parameters' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Put('assets/ebooks')
    async updateEbook(
        @Query('id') id: string,
        @Body() updateEbookDto: Partial<UpdateEbookDto>
    ): Promise<UpdateEbookResponseDto> {
        try {
            const response = await this.ebookService.updateEbook(id, updateEbookDto);
            return response;
        } catch (error) {
            console.error('There was an error updating the ebook:', error);
            throw error;
        }
    }


    @ApiOperation({ summary: 'Get all ebooks from Firestore or get ebooks based on keywords from their titles' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('assets/ebooks')
    async getEbooks(
        @Query('keywords') keywords?: string[]
    ): Promise<GetEbooksResponseDto> {
        if (keywords && Array.isArray(keywords) && keywords.length > 0) {
            const response = await this.ebookService.getEbooksByKeywords(keywords);
            return response;
        } else {
            const response =  await this.ebookService.getEbooks();
            return response;
        }
    }





}