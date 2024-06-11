/* eslint-disable prettier/prettier */
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CreatePromptDto } from './dto/createPrompt.dto';
import { UpdatePromptDto } from './dto/updatePrompt.dto';
import { Body, Controller, Param, Post, Put, Res, Delete, Get, Patch} from '@nestjs/common';
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
    @Get()
    async getAllPrompts(@Res() res: Response): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.getAllPrompts();
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

}
