import { Controller, Post, Body, Param, Get, Put, Req, Delete, InternalServerErrorException } from '@nestjs/common';
import { AddMediaOrEbookDto } from './dto/addMediaorEbook.dto';
import { AddMediaOrEbookResponseDto } from './dto/addMediaorEbookResponse.dto';
import { CreateSectionDto } from './dto/createSection.dto';
import { CreateSectionResponseDto } from './dto/createSectionResponse.dto';
import { DeleteSectionResponseDto } from './dto/deleteSectionResponse.dto';
import { GetSectionsResponseDto } from './dto/getSectionResponse.dto';
import { UpdateSectionDto } from './dto/updateSection.dto';
import { UpdateSectionResponseDto } from './dto/updateSectionResponse.dto';
import { SectionService } from './sections.service';




@Controller()
export class SectionController {
    constructor(private readonly sectionService: SectionService) { }

    @Post('firebase/sections')
    async createNewSection(@Body() createNewSectionDto: CreateSectionDto): Promise<CreateSectionResponseDto> {
        return this.sectionService.createNewSection(createNewSectionDto);
    }


    @Put('firebase/sections/:name/:description')
    async updateSection(@Param('name') name: string, @Param('description') description: string, @Body() updateSectionDto: Partial<UpdateSectionDto>, @Req() req: Request): Promise<UpdateSectionResponseDto> {

        return await this.sectionService.updateSection(name, description, updateSectionDto);
    }



    @Delete('firebase/sections/:name/:description')
    async deleteMedia(@Param('name') name: string, @Param('description') description: string, @Req() req: Request): Promise<DeleteSectionResponseDto> {

        return await this.sectionService.deleteSection(name, description);
    }


    @Get('firebase/sections')
    async getMedia(@Req() req: Request): Promise<GetSectionsResponseDto> {

        return this.sectionService.getSections();
    }


    @Get('firebase/sections/search-by-keywords')
    async getSectionsByKeywords(@Body('keywords') keywords: string[]): Promise<GetSectionsResponseDto> {
        const response = await this.sectionService.getSectionsByKeywords(keywords);
        return response;
    }


    @Get('firebase/sections/search-by-tags')
    async getSectionsByTags(@Body('tags') tags: string[]): Promise<GetSectionsResponseDto> {
        const response = await this.sectionService.getSectionsByTags(tags);
        return response;
    }


    @Get('firebase/sections/content/:name')
    async getSectionContent(@Param('name') sectionName: string): Promise<GetSectionsResponseDto> {
        return this.sectionService.getSectionContentByName(sectionName);
    }



    @Put('firebase/sections/add-media-or-ebook')
    async addMediaOrEbookToSection(
        @Body() addMediaOrEbookDto: AddMediaOrEbookDto,
    ): Promise<AddMediaOrEbookResponseDto> {
        try {
            const response = await this.sectionService.addMediaOrEbookToSection(addMediaOrEbookDto);
            return response;
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while processing your request.');
        }
    }





}