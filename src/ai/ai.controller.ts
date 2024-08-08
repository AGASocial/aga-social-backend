/* eslint-disable prettier/prettier */
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CreatePromptDto } from './dto/createPrompt.dto';
import { UpdatePromptDto } from './dto/updatePrompt.dto';
import { Body, Controller, Param, Post, Res, Delete, Get, Patch, Query, UseGuards} from '@nestjs/common';
import { ResponseDto } from '../shared/dto/response.dto';
import { Response } from 'express';
import { ExecutePromptDto } from './dto/executePrompt.dto';
import { CreateSequenceDto } from './dto/createSequence.dto';
import { UpdateSequenceDto } from './dto/updateSequence.dto';
import { AuthGuard } from '@nestjs/passport';


@Controller()
export class AiController {
    constructor(private readonly aiService: AiService) { }



    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Prompts')
    @ApiOperation({ summary: 'Create a new prompt' })
    @ApiOkResponse({ description: 'Prompt created successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiBody({ type: CreatePromptDto })
    @Post('prompts')
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

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Prompts')
    @ApiOperation({ summary: 'Update a prompt' })
    @ApiOkResponse({ description: 'Prompt updated successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiBody({ type: UpdatePromptDto })
    @ApiParam({ name: 'id', required: true, description: 'The ID of the prompt', example: 'B9Lkp2Ny4x89ldoxTxCn' })

    @Patch('prompts/:id')
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


    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Prompts')
    @ApiOperation({ summary: 'Delete a prompt' })
    @ApiOkResponse({ description: 'Prompt deleted successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiParam({ name: 'id', required: true, description: 'The ID of the prompt', example: 'B9Lkp2Ny4x89ldoxTxCn' })
    @Delete('prompts/:id')
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

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Prompts')
    @ApiOperation({ summary: 'Get all prompts' })
    @ApiOkResponse({ description: 'Prompts retrieved successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiQuery({ name: 'company', required: false, description: 'Company associated with the prompt', example: 'MyCompany' })
    @ApiQuery({ name: 'creator', required: false, description: 'Owner of the prompt. It is the userId', example: '18b49d73-6df5-4558-9b0e-03443a0674b6' })
    @ApiQuery({ name: 'app', required: false, description: 'App associated with the prompt', example: 'MyApp' })
    @ApiQuery({ name: 'tags', required: false, description: 'Tags associated with the prompt', example: 'tag1,tag2' })
    @Get('prompts')
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

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Prompts')
    @ApiOperation({ summary: 'Get a prompt by ID' })
    @ApiOkResponse({ description: 'Prompt retrieved successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiParam({ name: 'id', required: true, description: 'The ID of the prompt', example: 'B9Lkp2Ny4x89ldoxTxCn' })
    @Get('prompts/:id')
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


    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Prompts')
    @ApiOperation({ summary: 'Execute a prompt' })
    @ApiOkResponse({ description: 'Prompt executed successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiBody({ type: ExecutePromptDto })
    @ApiParam({ name: 'id', required: true, description: 'The ID of the prompt', example: 'B9Lkp2Ny4x89ldoxTxCn' })
    @Post('prompts/:id/completions')
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
    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Prompts')
    @ApiOperation({ summary: 'Get logs for a prompt' })
    @ApiOkResponse({ description: 'Logs retrieved successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiParam({ name: 'id', required: true, description: 'The ID of the prompt', example: 'B9Lkp2Ny4x89ldoxTxCn' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date for filtering logs', example: '2023-01-01' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date for filtering logs', example: '2023-01-31' })
    @Get('prompts/:id/logs')
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

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Sequences')
    @ApiOperation({ summary: 'Create a new sequence' })
    @ApiOkResponse({ description: 'Sequence created successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiBody({ type: CreateSequenceDto })
    @Post('sequences')
    async createNewSequenceEndpoint(@Res() res: Response, @Body() createSequenceDto: CreateSequenceDto): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.createNewSequence(createSequenceDto);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error creating a sequence:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to create a sequence',
                data: {},
            });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Sequences')
    @ApiOperation({ summary: 'Update a sequence' })
    @ApiOkResponse({ description: 'Sequence updated successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiBody({ type: UpdateSequenceDto })
    @ApiParam({ name: 'sequenceId', required: true, description: 'The ID of the sequence', example: 'cCnw2hDgX1FB1tzS1pTF' })
    @Patch('sequences/:sequenceId')
    async updateSequenceEndpoint(@Res() res: Response, @Param('sequenceId') sequenceId: string, @Body() updateSequenceDto: UpdateSequenceDto): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.updateSequence(sequenceId, updateSequenceDto);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error updating a sequence:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to update a sequence',
                data: {},
            });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Sequences')
    @ApiOperation({ summary: 'Get a sequence by ID' })
    @ApiOkResponse({ description: 'Sequence retrieved successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiParam({ name: 'sequenceId', required: true, description: 'The ID of the sequence', example: 'cCnw2hDgX1FB1tzS1pTF' })
    @Get('sequences/:sequenceId')
    async getSequenceEndpoint(@Res() res: Response, @Param('sequenceId') sequenceId: string): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.getSequence(sequenceId);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error retrieving a sequence:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve a sequence',
                data: {},
            });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Sequences')
    @ApiOperation({ summary: 'Get all sequences' })
    @ApiOkResponse({ description: 'Sequences retrieved successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: There was an error with the request, try again.' })
    @Get('sequences')
    async getAllSequencesEndpoint(@Res() res: Response): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.getAllSequences();
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error retrieving all sequences:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve sequences',
                data: {},
            });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Sequences')
    @ApiOperation({ summary: 'Delete a sequence' })
    @ApiOkResponse({ description: 'Sequence deleted successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: There was an error with the request, try again.' })
    @ApiParam({ name: 'sequenceId', required: true, description: 'The ID of the sequence', example: 'cCnw2hDgX1FB1tzS1pTF' })
    @Delete('sequences/:sequenceId')
    async deleteSequenceEndpoint(@Res() res: Response, @Param('sequenceId') sequenceId: string): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.deleteSequence(sequenceId);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error deleting the sequence:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to delete the sequence',
                data: {},
            });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Sequences')
    @ApiOperation({ summary: 'Execute an entire sequence of prompts' })
    @ApiOkResponse({ description: 'Sequence executed successfully', type: [ResponseDto] })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiBody({ type: ExecutePromptDto })
    @ApiParam({ name: 'sequenceId', required: true, description: 'The ID of the sequence to execute', example: 'dlUEsLmBSnRUDE6eTqRr' })
    @Post('sequences/:sequenceId')
    async executeSequenceEndpoint(
        @Res() res: Response,
        @Param('sequenceId') sequenceId: string,
        @Body() executePromptDto: ExecutePromptDto
    ): Promise<void> {
        try {
            const results: ResponseDto = await this.aiService.executeEntireSequence(sequenceId, executePromptDto);
            res.status(200).send({
                status: 'success',
                code: 200,
                message: 'Sequence executed successfully',
                data: results.data.result,
            });
        } catch (error) {
            console.error('Error executing the sequence:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: `Failed to execute the sequence: ${error.message}`,
                data: {},
            });
        }
    }


    @UseGuards(AuthGuard('jwt'))
    @ApiTags('Sequences')
    @ApiOperation({ summary: 'Get logs for a sequence' })
    @ApiOkResponse({ description: 'Logs retrieved successfully', type: ResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @ApiParam({ name: 'sequenceId', required: true, description: 'The ID of the sequence', example: 'cCnw2hDgX1FB1tzS1pTF' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date for filtering logs', example: '2023-01-01' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date for filtering logs', example: '2023-01-31' })
    @Get('sequences/:sequenceId/logs')
    async getSequenceLogsEndpoint(
        @Res() res: Response,
        @Param('sequenceId') sequenceId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<void> {
        try {
            const response: ResponseDto = await this.aiService.getSequenceLogs(sequenceId, startDate, endDate);
            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data,
            });
        } catch (error) {
            console.error('Error retrieving sequence logs:', error);
            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to retrieve sequence logs',
                data: {},
            });
        }
    }

}


