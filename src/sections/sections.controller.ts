import { Controller, Post, Body, Param, Get, Put, Req, Delete } from '@nestjs/common';
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


}