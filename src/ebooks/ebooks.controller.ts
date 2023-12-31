import { Controller, Post, Body, Param, Get, Put, Req, Delete, UseInterceptors, UploadedFile, Query, HttpStatus, HttpException } from '@nestjs/common';
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
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PurchaseEbookResponseDto } from './dto/purchaseEbookResponse.dto';
import { PurchaseEbookDto } from './dto/purchaseEbook.dto';
import { GetEbookByIdResponseDto } from './dto/getEbookByIdResponse.dto';



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
        @Body() updateEbookDto: Partial<UpdateEbookDto>
    ): Promise<UpdateEbookResponseDto> {
        try {
            const id = updateEbookDto.id

            const response = await this.ebookService.updateEbook(id, updateEbookDto);
            return response;
        } catch (error) {
            console.error('There was an error updating the ebook:', error);
            throw error;
        }
    }


    @ApiOperation({ summary: 'Get all ebooks from Firestore or get ebooks based on keywords from their titles' })
    @Get('assets/ebooks')
    async getEbooks(
        @Query('keywords') keywords?: string[],
    ): Promise<GetEbooksResponseDto | GetEbookByIdResponseDto> {
        if (keywords) {
            const response = await this.ebookService.getEbooksByKeywords(keywords);
            return response;
        }

        else {
            const response =  await this.ebookService.getEbooks();
            return response;
        }
    }


    @ApiOperation({ summary: 'Get an ebook by ID' })
    @ApiOkResponse({ description: 'Ebook retrieved successfully', type: GetEbookByIdResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('assets/ebooks/:id')
    async getEbookById(@Param('id') id: string): Promise<GetEbookByIdResponseDto> {
        const response = await this.ebookService.getEbookById(id);
        return response;
    }



    @Get('assets/ebooks/users')
    @ApiOperation({ summary: 'Personalizes a PDF file by putting a message with the actual date and name and email of the user' })
    @ApiQuery({ name: 'userId', type: String, description: 'User ID' })
    @ApiQuery({ name: 'ebookId', type: String, description: 'Ebook ID' })
    @ApiResponse({ status: 200, description: 'Ebook purchased successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async purchasePdf(
        @Query('userId') userId: string,
        @Query('ebookId') ebookId: string,
    ): Promise<any> {
        try {
            const response = await this.ebookService.purchasePdf(userId, ebookId);
            return response;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }



    @ApiOperation({ summary: 'Purchase an ebook' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('assets/ebooks/users')
    async purchaseEbook(
        @Body() purchaseEbookDto: PurchaseEbookDto,
    ): Promise<PurchaseEbookResponseDto> {
        const { userId, ebookId, paymentIntentId } = purchaseEbookDto;

        try {
            const response = await this.ebookService.purchaseEbook(userId, ebookId, paymentIntentId);
            return response;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }




    @ApiOperation({ summary: 'Get books purchased by the user' })
    @ApiQuery({ name: 'userId', type: String, required: true, description: 'User ID' })
    @ApiResponse({ status: 200, description: 'Success', type: GetEbooksResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Get('users/:id/ebooks') 
    async getPurchasedBooks(@Param('id') id: string): Promise<GetEbooksResponseDto> {
        try {
            const result = await this.ebookService.getPurchasedBooks(id);
            return result;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the purchased books for the user.');
        }
    }



}






