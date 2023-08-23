import { Controller, Post, Body, Param, Get, Put, Req, Delete, InternalServerErrorException, Query, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEbookDto } from '../ebooks/dto/createEbook.dto';
import { CreateMediaDto } from '../media/dto/createMedia.dto';
import { AddMediaOrEbookDto } from './dto/addMediaorEbook.dto';
import { AddMediaOrEbookResponseDto } from './dto/addMediaorEbookResponse.dto';
import { CreateSectionDto } from './dto/createSection.dto';
import { CreateSectionResponseDto } from './dto/createSectionResponse.dto';
import { DeactivateMediaOrEbookFromSectionDto } from './dto/deactivateMediaOrEbookFromSection.dto';
import { DeactivateMediaOrEbookFromSubsectionDto } from './dto/deactivateMediaOrEbookFromSubsection.dto';
import { DeleteSectionResponseDto } from './dto/deleteSectionResponse.dto';
import { GetSectionsResponseDto } from './dto/getSectionResponse.dto';
import { ManageResourceStatusInSectionDto } from './dto/manageResourceStatusInSection.dto';
import { ManageResourceStatusInSectionResponseDto } from './dto/manageResourceStatusInSectionResponse.dto';
import { UpdateSectionDto } from './dto/updateSection.dto';
import { UpdateSectionResponseDto } from './dto/updateSectionResponse.dto';
import { SectionService } from './sections.service';




@Controller()
@ApiTags('sections')
export class SectionController {
    constructor(private readonly sectionService: SectionService) { }




    @ApiOperation({ summary: 'Create a new section' })
    @ApiCreatedResponse({ description: 'Section created successfully', type: CreateSectionResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({ type: CreateSectionDto })
    @Post('sections')
    async createNewSection(@Body() createNewSectionDto: CreateSectionDto): Promise<CreateSectionResponseDto> {
        return this.sectionService.createNewSection(createNewSectionDto);
    }




    @Post('sections/subsections')
    @ApiOperation({ summary: 'Create a new subsection and add it to a parent section' })
    @ApiCreatedResponse({ description: 'Subsection created and added to parent section successfully', type: CreateSectionResponseDto })
    @ApiNotFoundResponse({ description: 'Parent section not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiQuery({ name: 'parentSectionName', description: 'Name of the parent section', required: true, type: 'string' })
    @ApiBody({ type: CreateSectionDto })
    async createAndAddSubsectionToSection(
        @Body() createSectionDto: CreateSectionDto,
        @Query('parentSectionName') parentSectionName: string
    ): Promise<CreateSectionResponseDto> {
        return this.sectionService.createAndAddSubsectionToSection(
            parentSectionName,
            createSectionDto
        );
    }





    @Put('sections')
    @ApiOperation({ summary: 'Update a section\'s details' })
    @ApiOkResponse({ description: 'Section updated successfully', type: UpdateSectionResponseDto })
    @ApiNotFoundResponse({ description: 'Section not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiQuery({ name: 'name', description: 'Name of the section', required: true, type: 'string' })
    @ApiBody({ type: UpdateSectionDto })
    async updateSection(
        @Query('name') name: string,
        @Body() updateSectionDto: Partial<UpdateSectionDto>,
        @Req() req: Request
    ): Promise<UpdateSectionResponseDto> {
        return await this.sectionService.updateSection(name, updateSectionDto);
    }





    //NOT IN USE

    @Delete('sections')
    @ApiOperation({ summary: 'Delete media from a section (not in use)' })
    @ApiOkResponse({ description: 'Section deleted successfully', type: DeleteSectionResponseDto })
    @ApiNotFoundResponse({ description: 'Section not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async deleteSection(
        @Query('name') name: string,
        @Query('description') description: string,
        @Req() req: Request
    ): Promise<DeleteSectionResponseDto> {
        return await this.sectionService.deleteSection(name, description);
    }



    @Get('sections')
    @ApiOperation({ summary: 'Get all sections, or get sections by its tags or get a sections content by its name or get sections by keywords on their title' })
    @ApiOkResponse({ description: 'Sections and media retrieved successfully', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getSections(
        @Req() req: Request,
        @Query('keywords') keywords?: string[],
        @Query('tags') tags?: string[],
        @Query('name') sectionName?: string
    ): Promise<GetSectionsResponseDto> {
        if (sectionName) {
            const response = await this.sectionService.getSectionContentByName(sectionName);
            return response;
        } else if (keywords && Array.isArray(keywords) && keywords.length > 0) {
            const response = await this.sectionService.getSectionsByKeywords(keywords);
            return response;
        } else if (tags && Array.isArray(tags) && tags.length > 0) {
            const response = await this.sectionService.getSectionsByTags(tags);
            return response;
        } else {
            return this.sectionService.getSections();
        }
    }




    @ApiOperation({ summary: 'Add media or ebook to section' })
    @ApiOkResponse({ description: 'Media or ebook added to section successfully', type: AddMediaOrEbookResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Patch('sections/media/ebooks')
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



    @Patch('sections/subsections/media/ebooks')
    @ApiOperation({ summary: 'Add media or ebook to subsection' })
    @ApiOkResponse({ description: 'Media or ebook added to subsection successfully', type: AddMediaOrEbookResponseDto })
    async addMediaOrEbookToSubsection(
        @Body() mediaOrEbookData: CreateMediaDto | CreateEbookDto,
        @Query('parentSectionName') parentSectionName: string,
        @Query('subsectionName') subsectionName: string
    ): Promise<AddMediaOrEbookResponseDto> {
        return this.sectionService.addMediaOrEbookToSubsection(
            mediaOrEbookData,
            parentSectionName,
            subsectionName
        );
    }





    @ApiOperation({ summary: 'Get subsections by section name' })
    @ApiOkResponse({ description: 'Subsections retrieved successfully', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('sections/subsections')
    async getSubsectionsBySectionName(
        @Query('sectionName') sectionName: string
    ): Promise<GetSectionsResponseDto> {
        return this.sectionService.getSubsectionsBySectionName(sectionName);
    }




    @ApiOperation({ summary: 'Update resource status in sections. Activates/Deactivates a Media/Ebook' })
    @ApiResponse({ status: 201, description: 'Resource status updated successfully', type: ManageResourceStatusInSectionResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({ type: ManageResourceStatusInSectionDto })
    @Patch('sections')
    async manageResourceStatus(@Body() manageResourceStatusDto: ManageResourceStatusInSectionDto): Promise<ManageResourceStatusInSectionResponseDto> {
        try {
            const response = await this.sectionService.manageResourceStatus(manageResourceStatusDto);
            return response;
        } catch (error) {
            throw new HttpException('Error updating resource status', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }




    @ApiOperation({ summary: 'Update resource status in subsections of sections. Activates/Deactivates a Media/Ebook' })
    @ApiResponse({ status: 201, description: 'Resource status updated successfully', type: ManageResourceStatusInSectionResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({ type: ManageResourceStatusInSectionDto })
    @Patch('sections/subsections')
    async manageResourceStatusForSubsections(
        @Body() manageResourceStatusDto: ManageResourceStatusInSectionDto,
    ): Promise<ManageResourceStatusInSectionResponseDto> {
        return this.sectionService.manageResourceStatusInSubsections(manageResourceStatusDto);
    }






}