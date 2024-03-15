import { Controller, Post, Body, Param, Get, Put, Req, Delete, UseInterceptors, UploadedFile, Query, HttpStatus, HttpException, Patch, Res } from '@nestjs/common';
import { CreateEbookDto } from './dto/createEbook.dto';
import { CreateEbookResponseDto } from './dto/createEbookResponse.dto';
import { GetEbooksResponseDto } from './dto/getEbooksResponse.dto';
import { UpdateEbookDto } from './dto/updateEbook.dto';
import { UpdateEbookResponseDto } from './dto/updateEbookResponse.dto';
import { EbookService } from './ebooks.service';
import { EbookFormat, EbookGenre } from './entities/ebooks.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadEbookResponseDto } from './dto/uploadEbookResponse.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PurchaseEbookResponseDto } from './dto/purchaseEbookResponse.dto';
import { PurchaseEbookDto } from './dto/purchaseEbook.dto';
import { GetEbookByIdResponseDto } from './dto/getEbookByIdResponse.dto';
import { Response } from "express";
import { PersonalizeEbookResponseDto } from './dto/personalizeEbookResponse.dto';



@Controller()
@ApiTags('Ebooks')
export class EbookController {
    constructor(private readonly ebookService: EbookService) { }



    
    @ApiTags('Ebooks')
    @ApiOperation({ summary: 'Upload and create an ebook' })
    @ApiOkResponse({ description: 'Ebook uploaded and created successfully', type: UploadEbookResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to upload/create ebook' })
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
        @Res() res: Response
    ): Promise<void> {
        try {
            const createNewEbookDto: CreateEbookDto = {
                title,
                description,
                titlePage,
                author,
                releaseDate,
                price,
                language,
                pageCount,
                genres,
                format,
                publisher,
            };

            const result: UploadEbookResponseDto = await this.ebookService.uploadAndCreateEbook(file, createNewEbookDto);

            res.status(result.code).send({
                status: result.status,
                code: result.code,
                message: result.message,
                data: result.data.result,
            });

        } catch (error) {
            console.error('Error uploading media or creating ebook:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to upload/create ebook',
                data: {},
            });
        }
    }








    @ApiBody({ type: UpdateEbookDto })
    @ApiTags('Ebooks')
    @ApiOperation({ summary: 'Update an ebook' })
    @ApiOkResponse({ description: 'Ebook updated successfully', type: UpdateEbookResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or ebook not found' })
    @ApiParam({ name: 'ebookId', description: 'ID of the ebook', type: 'string', example: 'IZgEKURRdomYceeFZ3RS' })
    @Patch('assets/ebooks/:ebookId')
    async updateEbook(
        @Body() updateEbookDto: Partial<UpdateEbookDto>,
        @Param('ebookId') ebookId: string,
        @Res() res: Response
    ): Promise<void> {
        try {

            const response: UpdateEbookResponseDto = await this.ebookService.updateEbook(ebookId, updateEbookDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error updating the ebook:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to update the ebook',
                data: {},
            });
        }
    }


    @ApiTags('Ebooks')
    @ApiOperation({ summary: 'Get a list of ebooks or get ebooks with certain keywords' })
    @ApiOkResponse({ description: 'Ebooks retrieved successfully', type: GetEbooksResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to retrieve ebooks' })
    @ApiQuery({ name: 'keywords', type: [String], isArray: true, required: false })
    @Get('assets/ebooks')
    async getEbooks(
        @Res() res: Response,
        @Query('keywords') keywords?: string[]
    ): Promise<void> {
        try {
            let response: GetEbooksResponseDto | GetEbookByIdResponseDto;

            if (keywords) {
                response = await this.ebookService.getEbooksByKeywords(keywords);
            } else {
                response = await this.ebookService.getEbooks();
            }

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error retrieving ebooks:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to retrieve ebooks',
                data: {},
            });
        }
    }



    @ApiTags('Ebooks')
    @ApiOperation({ summary: 'Get ebook by ID' })
    @ApiOkResponse({ description: 'Ebook retrieved successfully', type: GetEbookByIdResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or ebook not found' })
    @ApiParam({ name: 'ebookId', description: 'ID of the ebook', type: 'string', example: 'IZgEKURRdomYceeFZ3RS' })
    @Get('assets/ebooks/:ebookId')
    async getEbookById(
        @Param('ebookId') ebookId: string,
        @Res() res: Response
    ): Promise<void> {
        try {
            const response: GetEbookByIdResponseDto = await this.ebookService.getEbookById(ebookId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error retrieving the ebook:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to retrieve the ebook',
                data: {},
            });
        }
    }



    @ApiTags('Ebooks')
    @ApiOperation({ summary: 'Purchase PDF for an ebook' })
    @ApiOkResponse({ description: 'PDF purchased successfully', type: PersonalizeEbookResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to purchase PDF' })
    @ApiQuery({ name: 'userId', type: 'string', required: true, example: '0EwINikFVAg7jtRdkZYiTBXN4vW2' })
    @ApiParam({ name: 'ebookId', description: 'ID of the ebook', type: 'string', example: 'IZgEKURRdomYceeFZ3RS' })
    @Get('assets/ebooks/users')
    async purchasePdf(
        @Query('userId') userId: string,
        @Query('ebookId') ebookId: string,
        @Res() res: Response
    ): Promise<void> {
        try {
            const response: PersonalizeEbookResponseDto = await this.ebookService.purchasePdf(userId, ebookId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to purchase PDF',
                data: {},
            });
        }
    }




    
    @ApiTags('Ebooks')
    @ApiOperation({ summary: 'Purchase an ebook' })
    @ApiOkResponse({ description: 'Ebook purchased successfully', type: PurchaseEbookResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to purchase ebook' })
    @Post('assets/ebooks/users')
    async purchaseEbook(
        @Body() purchaseEbookDto: PurchaseEbookDto,
        @Res() res: Response
    ): Promise<void> {
        const { userId, ebookId, paymentIntentId } = purchaseEbookDto;

        try {
            const response: PurchaseEbookResponseDto = await this.ebookService.purchaseEbook(userId, ebookId, paymentIntentId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('Error:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to purchase ebook',
                data: {},
            });
        }
    }





   
    @ApiTags('Ebooks')
    @ApiOperation({ summary: 'Get purchased ebooks by user ID' })
    @ApiOkResponse({ description: 'Purchased ebooks retrieved successfully', type: GetEbooksResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to retrieve purchased ebooks' })
    @ApiQuery({ name: 'userId', type: 'string', required: true, example: '0EwINikFVAg7jtRdkZYiTBXN4vW2' })
    @Get('users/:userId/ebooks')
    async getPurchasedBooks(
        @Param('userId') userId: string,
        @Res() res: Response
    ): Promise<void> {
        try {
            const response: GetEbooksResponseDto = await this.ebookService.getPurchasedBooks(userId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

        } catch (error) {
            console.error('An error occurred:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to retrieve purchased ebooks',
                data: {},
            });
        }
    }



}






