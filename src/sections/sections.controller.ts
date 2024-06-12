import { Controller, Post, Body, Param, Get, Put, Req, Delete, InternalServerErrorException, Query, Patch, HttpException, HttpStatus, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddMediaOrEbookResponseDto } from './dto/addMediaorEbookResponse.dto';
import { CreateSectionDto } from './dto/createSection.dto';
import { CreateSectionResponseDto } from './dto/createSectionResponse.dto';
import { GetSectionsResponseDto } from './dto/getSectionResponse.dto';
import { ManageResourceStatusInSectionDto } from './dto/manageResourceStatusInSection.dto';
import { ManageResourceStatusInSectionResponseDto } from './dto/manageResourceStatusInSectionResponse.dto';
import { ManageResourceStatusInSubsectionDto } from './dto/manageResourceStatusInSubsection.dto';
import { UpdateSectionDto } from './dto/updateSection.dto';
import { UpdateSectionResponseDto } from './dto/updateSectionResponse.dto';
import { SectionService } from './sections.service';
import { Response } from "express";




@Controller()
export class SectionController {
    constructor(private readonly sectionService: SectionService) { }




   
    @ApiTags('Sections')
    @ApiOperation({ summary: 'Create a new section' })
    @ApiBody({ type: CreateSectionDto })
    @ApiOkResponse({ description: 'Section created successfully', type: CreateSectionResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @Post('sections')
    async createNewSection(
        @Res() res: Response,
        @Body() createNewSectionDto: CreateSectionDto,
    ): Promise<void> {
        try {
            const response: CreateSectionResponseDto = await this.sectionService.createNewSection(createNewSectionDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error creating new section:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to create new section',
                data: {},
            });
        }
    }




    @ApiTags('Sections')
    @ApiOperation({ summary: 'Create and add a subsection to a section' })
    @ApiBody({ type: CreateSectionDto })
    @ApiOkResponse({ description: 'Subsection created and added successfully', type: CreateSectionResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @Post('sections/:id/subsections')
    async createAndAddSubsectionToSection(
        @Res() res: Response,
        @Body() createSectionDto: CreateSectionDto,
        @Param('id') id: string,
    ): Promise<void> {
        try {
            const response: CreateSectionResponseDto = await this.sectionService.createAndAddSubsectionToSection(id, createSectionDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error creating and adding subsection to section:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to create and add subsection to section',
                data: {},
            });
        }
    }





    @ApiTags('Sections')
    @ApiOperation({ summary: 'Update a section' })
    @ApiBody({ type: UpdateSectionDto })
    @ApiOkResponse({ description: 'Section updated successfully', type: UpdateSectionResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or section not found' })
    @Patch('sections/:sectionId')
    @ApiParam({ name: 'sectionId', description: 'ID of the section to update', type: 'string', example: '4AZcWZU5T55VabyeJ8QY' })
    async updateSection(
        @Res() res: Response,
        @Body() updateSectionDto: Partial<UpdateSectionDto>,
        @Param('sectionId') sectionId: string,
    ): Promise<void> {
        try {
            const response: UpdateSectionResponseDto = await this.sectionService.updateSection(sectionId, updateSectionDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error updating section:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to update section',
                data: {},
            });
        }
    }






    @ApiTags('Sections')
    @ApiOperation({ summary: 'Get sections' })
    @ApiQuery({ name: 'tags', type: [String], required: false,  })
    @ApiQuery({ name: 'keywords', type: [String], required: false})
    @ApiOkResponse({ description: 'Sections retrieved successfully', type: GetSectionsResponseDto })
    @Get('sections')
    async getSections(
        @Res() res: Response,
        @Query('tags') tags?: string[],
        @Query('keywords') keywords?: string[]
    ): Promise<void> {
        try {
            let response: GetSectionsResponseDto;

            if (tags) {
                response = await this.sectionService.getSectionsByTags(tags);
            } else if (keywords) {
                response = await this.sectionService.getSectionsByKeywords(keywords);
            } else {
                response = await this.sectionService.getSections();
            }

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error retrieving sections:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve sections',
                data: {},
            });
        }
    }


    @ApiTags('Sections')
    @ApiOperation({ summary: 'Get section by ID' })
    @ApiParam({ name: 'id', description: 'ID of the section', type: 'string', example: '4AZcWZU5T55VabyeJ8QY' })
    @ApiOkResponse({ description: 'Section retrieved successfully', type: GetSectionsResponseDto })
    @Get('sections/:id')
    async getSectionById(
        @Res() res: Response,
        @Param('id') sectionId: string,
    ): Promise<void> {
        try {
            const response: GetSectionsResponseDto = await this.sectionService.getSectionContentById(sectionId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error retrieving section by ID:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve section by ID',
                data: {},
            });
        }
    }





   
    @ApiTags('Sections')
    @ApiOperation({ summary: 'Add media or ebook to section' })
    @ApiOkResponse({ description: 'Media or ebook added successfully', type: AddMediaOrEbookResponseDto })
    @Patch('sections/:sectionId/assets/:assetId')
    @ApiParam({ name: 'sectionId', description: 'ID of the section', type: 'string', example: '4AZcWZU5T55VabyeJ8QY' })
    @ApiParam({ name: 'assetId', description: 'ID of the media or ebook', type: 'string', example: '1150258b-3f5c-4f77-88b9-8a99df077c90' })
    async addMediaOrEbookToSection(
        @Res() res: Response,
        @Param('sectionId') sectionId: string,
        @Param('assetId') assetId: string,
    ): Promise<void> {
        try {
            const response: AddMediaOrEbookResponseDto = await this.sectionService.addMediaOrEbookToSection(sectionId, assetId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error adding media or ebook to section:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to add media or ebook to section',
                data: {},
            });
        }
    }



    @ApiTags('Sections')
    @ApiOperation({ summary: 'Add media or ebook to subsection' })
    @ApiOkResponse({ description: 'Media or ebook added to subsection successfully', type: AddMediaOrEbookResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Missing required parameters' })
    @Patch('sections/:sectionId/subsections/:subsectionId/assets/:assetId')
    @ApiParam({ name: 'sectionId', description: 'ID of the section', type: 'string', example: '4AZcWZU5T55VabyeJ8QY' })
    @ApiParam({ name: 'subsectionId', description: 'ID of the subsection', type: 'string', example: '5a30496f-32bf-4730-bb39-4485239dbec3' })
    @ApiParam({ name: 'assetId', description: 'ID of the media or ebook', type: 'string', example: '1150258b-3f5c-4f77-88b9-8a99df077c90' })
    async addMediaOrEbookToSubsection(
        @Res() res: Response,
        @Param('sectionId') sectionId: string,
        @Param('subsectionId') subsectionId: string,
        @Param('assetId') assetId: string,
    ): Promise<void> {
        try {
            const response: AddMediaOrEbookResponseDto = await this.sectionService.addMediaOrEbookToSubsection(sectionId, subsectionId, assetId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error adding media or ebook to subsection:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to add media or ebook to subsection',
                data: {},
            });
        }
    }



    @ApiTags('Sections')
    @ApiOperation({ summary: 'Get subsections by section ID' })
    @ApiOkResponse({ description: 'Subsections retrieved successfully', type: GetSectionsResponseDto })
    @ApiParam({ name: 'id', description: 'ID of the section', type: 'string', example: '4AZcWZU5T55VabyeJ8QY' })
    @Get('sections/:id/subsections')
    async getSubsectionsBySectionId(
        @Res() res: Response,
        @Param('id') id: string,
    ): Promise<void> {
        try {
            const response: GetSectionsResponseDto = await this.sectionService.getSubsectionsBySectionId(id);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error retrieving subsections by section ID:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve subsections',
                data: {},
            });
        }
    }




    @ApiTags('Sections')
    @ApiOperation({ summary: 'Manage resource status in section' })
    @ApiBody({ type: ManageResourceStatusInSectionDto })
    @ApiOkResponse({ description: 'Resource status managed successfully', type: ManageResourceStatusInSectionResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiParam({ name: 'sectionId', description: 'ID of the section to update', type: 'string', example: '4AZcWZU5T55VabyeJ8QY' })
    @Patch('sections/:sectionId/assets')
    async manageResourceStatus(
        @Res() res: Response,
        @Body() manageResourceStatusDto: ManageResourceStatusInSectionDto,
        @Param('sectionId') sectionId: string
    ): Promise<void> {
        try {
            const response: ManageResourceStatusInSectionResponseDto = await this.sectionService.manageResourceStatus(sectionId, manageResourceStatusDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error managing resource status in section:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to manage resource status',
                data: {},
            });
        }
    }




    @ApiTags('Sections') 
    @ApiOperation({ summary: 'Manage resource status in subsection' }) 
    @ApiBody({ type: ManageResourceStatusInSubsectionDto }) 
    @ApiOkResponse({ description: 'Resource status managed successfully', type: ManageResourceStatusInSectionResponseDto }) 
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' }) 
    @ApiParam({ name: 'subsectionId', description: 'ID of the subsection to update', type: 'string', example: '4AZcWZU5T55VabyeJ8QY' })
    @Patch('subsections/:subsectionId/assets') 
    async manageResourceStatusForSubsections(
        @Res() res: Response,
        @Body() manageResourceStatusDto: ManageResourceStatusInSubsectionDto,
        @Param('subsectionId') subsectionId: string
    ): Promise<void> {
        try {
            const response: ManageResourceStatusInSectionResponseDto = await this.sectionService.manageResourceStatusInSubsections(subsectionId, manageResourceStatusDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error managing resource status for subsections:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to manage resource status for subsections',
                data: {},
            });
        }
    }





}