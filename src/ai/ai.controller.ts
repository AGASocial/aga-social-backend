/* eslint-disable prettier/prettier */
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CreatePromptDto } from './dto/createPrompt.dto';
import { UpdatePromptDto } from './dto/updatePrompt.dto';
import { Body, Controller, Param, Post, Put, Res, Delete, Get, Patch, Query} from '@nestjs/common';
import { ResponseDto } from '../shared/dto/response.dto';
import { Response } from 'express';
import { ExecutePromptDto } from './dto/executePrompt.dto';


@ApiTags('Prompts')
@Controller('prompts')
export class AiController {
    constructor(private readonly aiService: AiService) { }





    @ApiOperation({ summary: 'Create a new prompt' })
    @ApiOkResponse({ description: 'Prompt created successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiBody({ type: CreatePromptDto })
    @Post()
    async createNewPrompt(@Res() res: Response, @Body() createPromptDto: CreatePromptDto): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.createNewPrompt(createPromptDto);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error creating a prompt:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to create a prompt',
                data: {},
            });
        }
    }



    @ApiOperation({ summary: 'Update a prompt' })
    @ApiOkResponse({ description: 'Prompt updated successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiBody({ type: UpdatePromptDto })
    @ApiParam({ name: 'id', required: true, description: 'The ID of the prompt', example: 'B9Lkp2Ny4x89ldoxTxCn' })

    @Patch(':id')
    async updatePrompt(@Res() res: Response, @Param('id') id: string, @Body() updatePromptDto: UpdatePromptDto): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.updatePrompt(id, updatePromptDto);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error updating a prompt:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to update a prompt',
                data: {},
            });
        }
    }




    @ApiOperation({ summary: 'Delete a prompt' })
    @ApiOkResponse({ description: 'Prompt deleted successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiParam({ name: 'id', required: true, description: 'The ID of the prompt', example: 'B9Lkp2Ny4x89ldoxTxCn' })
    @Delete(':id')
    async deletePrompt(@Res() res: Response, @Param('id') id: string): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.deletePrompt(id);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error deleting a prompt:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to delete a prompt',
                data: {},
            });
        }
    }



    @ApiOperation({ summary: 'Get all prompts' })
    @ApiOkResponse({ description: 'Prompts retrieved successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiQuery({ name: 'company', required: false, description: 'Company associated with the prompt', example: 'MyCompany' })
    @ApiQuery({ name: 'creator', required: false, description: 'Owner of the prompt. It is the userId', example: '18b49d73-6df5-4558-9b0e-03443a0674b6' })
    @ApiQuery({ name: 'app', required: false, description: 'App associated with the prompt', example: 'MyApp' })
    @ApiQuery({ name: 'tags', required: false, description: 'Tags associated with the prompt', example: 'tag1,tag2' })
    @Get()
    async getAllPrompts(
        @Res() res: Response,
        @Query('company') company?: string,
        @Query('creator') creator?: string,
        @Query('app') app?: string,
        @Query('tags') tags?: string[],
    ): Promise<void> {
        try {
            let response: ResponseDto;

            if (company || creator || app || tags) {
                response = await this.aiService.getPromptsByQuery({
                    company,
                    creator,
                    app,
                    tags,
                });
            } else {
                response = await this.aiService.getAllPrompts();
            }

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error retrieving prompts:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve prompts',
                data: {},
            });
        }
    }



    @ApiOperation({ summary: 'Get a prompt by ID' })
    @ApiOkResponse({ description: 'Prompt retrieved successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiParam({ name: 'id', required: true, description: 'The ID of the prompt', example: 'B9Lkp2Ny4x89ldoxTxCn' })
    @Get(':id')
    async getPromptById(@Res() res: Response, @Param('id') id: string): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.getPromptById(id);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error retrieving a prompt:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve a prompt',
                data: {},
            });
        }
    }


    @ApiOperation({ summary: 'Execute a prompt' })
    @ApiOkResponse({ description: 'Prompt executed successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiBody({ type: ExecutePromptDto })
    @ApiParam({ name: 'id', required: true, description: 'The ID of the prompt', example: 'B9Lkp2Ny4x89ldoxTxCn' })
    @Post(':id/completions')
    async executePrompt(@Res() res: Response, @Param('id') id: string, @Body() executePromptDto: ExecutePromptDto): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.executePrompt(id, executePromptDto);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error executing a prompt:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to execute a prompt',
                data: {},
            });
        }
    }
    @ApiOperation({ summary: 'Get logs for a prompt' })
    @ApiOkResponse({ description: 'Logs retrieved successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiParam({ name: 'id', required: true, description: 'The ID of the prompt', example: 'B9Lkp2Ny4x89ldoxTxCn' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date for filtering logs', example: '2023-01-01' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date for filtering logs', example: '2023-01-31' })
    @Get(':id/logs')
    async getPromptLogsEndpoint(
        @Res() res: Response,
        @Param('id') promptId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.getPromptLogs(promptId, startDate, endDate);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error retrieving prompt logs:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve prompt logs',
                data: {},
            });
        }
    }

}
