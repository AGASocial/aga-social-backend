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
import { ManageResourceStatusInSubsectionDto } from './dto/manageResourceStatusInSubsection.dto';
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
    @ApiBody({ type: CreateSectionDto })
    async createAndAddSubsectionToSection(
        @Body() createSectionDto: CreateSectionDto,
        @Query('parentSectionId') parentSectionId: string 
    ): Promise<CreateSectionResponseDto> {
        return this.sectionService.createAndAddSubsectionToSection(
            parentSectionId,
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
        @Query('id') id: string,
        @Body() updateSectionDto: Partial<UpdateSectionDto>,
        @Req() req: Request
    ): Promise<UpdateSectionResponseDto> {
        return await this.sectionService.updateSection(id, updateSectionDto);
    }





    @Get('sections')
    @ApiOperation({
        summary: 'Get all sections, or get sections by its tags or get a sections content by its name'
    })
    @ApiOkResponse({ description: 'Sections and media retrieved successfully', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getSections(
        @Req() req: Request,
        @Query('tags') tags?: string[],
        @Query('sectionId') sectionId?: string,
        @Query('keywords') keywords?: string[]
    ): Promise<GetSectionsResponseDto> {
        if (sectionId) {
            const response = await this.sectionService.getSectionContentById(sectionId);
            return response;
        }

        if (tags) {
            const response = await this.sectionService.getSectionsByTags(tags);
            return response;
        }

        if (keywords) {
            const response = await this.sectionService.getSectionsByKeywords(keywords);
            return response;
        }

        return this.sectionService.getSections();
    }





    @ApiOperation({ summary: 'Add media or ebook to section' })
    @ApiOkResponse({ description: 'Media or ebook added to section successfully', type: AddMediaOrEbookResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Patch('sections/assets')
    async addMediaOrEbookToSection(
        @Body() requestBody: { sectionId: string, assetId: string },
    ): Promise<AddMediaOrEbookResponseDto> {
        try {
            const { sectionId, assetId } = requestBody;
            const response = await this.sectionService.addMediaOrEbookToSection(sectionId, assetId);
            return response;
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while processing your request.');
        }
    }



    @Patch('sections/subsections/assets')
    @ApiOperation({ summary: 'Add media or ebook to subsection' })
    @ApiOkResponse({ description: 'Media or ebook added to subsection successfully', type: AddMediaOrEbookResponseDto })
    async addMediaOrEbookToSubsection(
        @Body() request: { sectionId: string, subsectionId: string, resourceId: string }
    ): Promise<AddMediaOrEbookResponseDto> {
        const sectionId = request.sectionId;
        const subsectionId = request.subsectionId;
        const resourceId = request.resourceId;

        return this.sectionService.addMediaOrEbookToSubsection(
            sectionId,
            subsectionId,
            resourceId
        );
    }





    @ApiOperation({ summary: 'Get subsections by section name' })
    @ApiOkResponse({ description: 'Subsections retrieved successfully', type: GetSectionsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('sections/subsections')
    async getSubsectionsBySectionId(
        @Query('id') id: string
    ): Promise<GetSectionsResponseDto> {
        return this.sectionService.getSubsectionsBySectionId(id);
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
    @ApiBody({ type: ManageResourceStatusInSubsectionDto })
    @Patch('sections/subsections')
    async manageResourceStatusForSubsections(
        @Body() manageResourceStatusDto: ManageResourceStatusInSubsectionDto,
    ): Promise<ManageResourceStatusInSectionResponseDto> {
        return this.sectionService.manageResourceStatusInSubsections(manageResourceStatusDto);
    }






}