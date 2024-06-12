import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, Patch, Post, Put, Query, Res } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AddTagsResponseDto } from "./dto/addTagsResponse.dto";
import { CreateMessageDto } from "./dto/createMessage.dto";
import { CreateMessageResponseDto } from "./dto/createMessageResponse.dto";
import { GetMessageByIdResponseDto } from "./dto/getMessageByIdResponse.dto";
import { GetMessagesByUserResponseDto } from "./dto/getMessagesByUserResponse.dto";
import { UpdateMessageStatusDto } from "./dto/updateMessageStatus.dto";
import { UpdateMessageStatusResponseDto } from "./dto/updateMessageStatusResponse.dto";
import { MessageService } from "./message.service";
import { Response } from "express";
import { AddOrRemoveTagsRequestDto } from "./dto/addOrRemoveTags.dto";


@Controller()
export class MessageController {
    constructor(private readonly messageService: MessageService) { }



    @ApiBody({ type: CreateMessageDto })
    @ApiTags('Messages')
    @ApiOperation({ summary: 'Create and send a message' })
    @ApiOkResponse({ description: 'Message created and sent successfully', type: CreateMessageResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or failed to create/send the message' })
    @Post('messages')
    async createAndSendMessage(
        @Res() res: Response,
        @Body() createNewMessageDto: CreateMessageDto
    ): Promise<void> {
        try {
            const response: CreateMessageResponseDto = await this.messageService.createAndSendMessage(createNewMessageDto);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error creating and sending message:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to create and send the message',
                data: {},
            });
        }
    }



    @ApiTags('Messages')
    @ApiOperation({ summary: 'Get a message by ID' })
    @ApiParam({ name: 'messageId', description: 'ID of the message', type: 'string', example: 'vBwKpakszeh6T7RBiwDz' })
    @ApiOkResponse({ description: 'Message retrieved successfully', type: GetMessageByIdResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or message not found' })
    @Get('messages/:messageId')
    async getMessageById(
        @Res() res: Response,
        @Param('messageId') messageId: string
    ): Promise<void> {
        try {
            const response: GetMessageByIdResponseDto = await this.messageService.getMessageById(messageId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error retrieving message by ID:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to retrieve message by ID',
                data: {},
            });
        }
    }

    @ApiTags('Messages')
    @ApiOperation({ summary: 'Get messages for a user with optional filters' })
    @ApiOkResponse({ description: 'Messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or user not found' })
    @ApiParam({ name: 'userId', description: 'ID of the user', type: 'string', example: '0EwINikFVAg7jtRdkZYiTBXN4vW2' })
    @ApiQuery({ name: 'keywords', description: 'Array of keywords to search for', type: 'array', required: false, example: 'hello' })
    @ApiQuery({ name: 'filter', description: 'Filter criteria for messages. Filters are: read, unread, highlighted, archived, inquiry, complaint, sent, received, deleted', type: 'string', required: false, example: 'unread' })
    @ApiQuery({ name: 'tags', description: 'Array of tags to filter messages', type: 'array', required: false })
    @Get('messages/users/:userId')
    async getMessages(
        @Res() res: Response,
        @Param('userId') userId: string,
        @Query('keywords') keywords: string[],
        @Query('filter') filter: string,
        @Query('tags') tags: string[],
    ): Promise<void> {
        try {
            let response: GetMessagesByUserResponseDto;

            if (keywords && keywords.length > 0) {
                response = await this.messageService.searchMessagesByKeywords(userId, keywords);
            } else if (filter && !keywords) {
                response = await this.messageService.getFilteredMessages(filter, userId);
            } else if (tags && !filter && !keywords) {
                response = await this.messageService.searchMessagesByTags(userId, tags);
            } else {
                response = await this.messageService.getUserMessages(userId);
            }

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error retrieving messages:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to retrieve messages',
                data: {},
            });
        }
    }




   
    @ApiTags('Messages')
    @ApiBody({ type: UpdateMessageStatusDto })
    @ApiOperation({ summary: 'Update message status by ID' })
    @ApiParam({ name: 'messageId', description: 'ID of the message', type: 'string', example: 'vBwKpakszeh6T7RBiwDz' })
    @ApiOkResponse({ description: 'Message status updated successfully', type: UpdateMessageStatusResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or message not found' })
    @Patch('messages/:messageId')
    async updateMessageStatus(
        @Res() res: Response,
        @Param('messageId') messageId: string,
        @Body() dto: UpdateMessageStatusDto,
    ): Promise<void> {
        try {
            const response: UpdateMessageStatusResponseDto = await this.messageService.updateMessageStatus(messageId, dto);


            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error updating message status:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to update messages',
                data: {},
            });
        }
    }


    @ApiTags('Messages')
    @ApiOperation({ summary: 'Add or remove tags to message by user email and tag names' })
    @ApiBody({ type: AddOrRemoveTagsRequestDto })
    @ApiOkResponse({ description: 'Tags added or removed successfully', type: AddTagsResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Missing required parameters' })
    @ApiParam({ name: 'messageId', description: 'ID of the message', type: 'string', example:'vBwKpakszeh6T7RBiwDz' })
    @Patch('messages/:messageId/tags')
    async addOrRemoveTagsToMessageByUserEmailAndTagNames(
        @Res() res: Response,
        @Param('messageId')  messageId: string,
        @Body() body: AddOrRemoveTagsRequestDto,
    ): Promise<void> {
        try {
            const { tagsIds, action } = body;

            const response: AddTagsResponseDto = await this.messageService.addOrRemoveTagsFromMessage(messageId, action, tagsIds);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });
        } catch (error) {
            console.error('Error adding or removing tags to the message:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Failed to add or remove tags to the message.',
                data: {},
            });
        }
    }


   



}