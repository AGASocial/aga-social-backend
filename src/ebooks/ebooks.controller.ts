import { Controller, Post, Body, Param, Get, Put, Req, Delete } from '@nestjs/common';
import { CreateEbookDto } from './dto/createEbook.dto';
import { CreateEbookResponseDto } from './dto/createEbookResponse.dto';
import { DeleteEbookDto } from './dto/deleteEbook.dto';
import { DeleteEbookResponseDto } from './dto/deleteEbookResponse.dto';
import { GetEbooksResponseDto } from './dto/getEbooksResponse.dto';
import { UpdateEbookDto } from './dto/updateEbook.dto';
import { UpdateEbookResponseDto } from './dto/updateEbookResponse.dto';
import { EbookService } from './ebooks.service';
import { EbookFormat } from './entities/ebooks.entity';


@Controller()
export class EbookController {
    constructor(private readonly ebookService: EbookService) { }

    @Post('firebase/ebooks')
    async createNewEbook(@Body() createNewEbookDto: CreateEbookDto): Promise<CreateEbookResponseDto> {
        return this.ebookService.createNewEbook(createNewEbookDto);
    }


    @Put('firebase/ebooks')
    async updateEbook(@Body() updateEbookDto: Partial<UpdateEbookDto>): Promise<UpdateEbookResponseDto> {
        try {
            const url = updateEbookDto.url;
            const response = await this.ebookService.updateEbook(url, updateEbookDto);
            return response;
        } catch (error) {
            console.error('There was an error updating the ebook:', error);
            throw error;
        }
    }


    @Delete('firebase/ebooks/:title/:format')
    async deleteMedia(@Param('title') title: string, @Param('format') format: EbookFormat, @Req() req: Request): Promise<DeleteEbookResponseDto> {

        return await this.ebookService.deleteEbook(title, format);
    }


    @Get('firebase/ebooks')
    async getMedia(@Req() req: Request): Promise<GetEbooksResponseDto> {

        return this.ebookService.getEbooks();
    }

}