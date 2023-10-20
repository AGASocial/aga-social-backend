import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { AddTagsResponseDto } from "./dto/addTagsResponse.dto";
import { CreateMessageDto } from "./dto/createMessage.dto";
import { CreateMessageResponseDto } from "./dto/createMessageResponse.dto";
import { DeleteMessageResponseDto } from "./dto/deleteMessageResponse.dto";
import { GetMessageByIdResponseDto } from "./dto/getMessageByIdResponse.dto";
import { GetMessagesByKeywordsDto } from "./dto/getMessagesByKeywords.dto";
import { GetMessagesByUserResponseDto } from "./dto/getMessagesByUserResponse.dto";
import {GetMessagesFilteredDto } from "./dto/getMessagesFiltered.dto";
import { MarkAsArchivedResponseDto } from "./dto/markAsArchivedResponse.dto";
import { MarkAsReadResponseDto } from "./dto/markAsReadResponse.dto";
import { UpdateMessageStatusDto } from "./dto/updateMessageStatus.dto";
import { UpdateMessageStatusResponseDto } from "./dto/updateMessageStatusResponse.dto";
import { MessageService } from "./message.service";


@Controller()
@ApiTags('Messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) { }



    @ApiOperation({ summary: 'Creates and sends a message to a user' })
    @ApiCreatedResponse({ description: 'Message created successfully.', type: CreateMessageResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request.' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
    @Post('messages')
    async createAndSendMessage(@Body() createNewMessageDto: CreateMessageDto): Promise<CreateMessageResponseDto> {
        try {
            const responseDto = await this.messageService.createAndSendMessage(createNewMessageDto);
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

  


    /*
    @ApiOperation({ summary: 'Get messages by user email, keywords, or filters' })
    @ApiOkResponse({ description: 'Messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @Get('messages')
    async getMessages(
        @Query('filter') filter?: string,
        @Query('id') id?: string,
        @Query('messageId') messageId?: string,
        @Query('keywords') keywords?: string[],
        @Query('tags') tags?: string[], 
    ): Promise<GetMessagesByUserResponseDto | GetMessageByIdResponseDto> {
        if (filter && id) {
            return await this.messageService.getFilteredMessages(filter, id);
        } else if (id && keywords) {
            return await this.messageService.searchMessagesByKeywords(id, keywords);
        } else if (id && tags) { 
            return await this.messageService.searchMessagesByTags(id, tags);
        } 
       
        else {
            throw new BadRequestException('Invalid parameters');
        }
    }*/



    @Get('messages/:messageId')
    @ApiOperation({ summary: 'Get a message by its ID' })
    @ApiOkResponse({ description: 'Message retrieved successfully', type: GetMessageByIdResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or message not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getMessageById(@Param('messageId') messageId: string): Promise<GetMessageByIdResponseDto> {
        console.log('Get Single Message')

        return this.messageService.getMessageById(messageId);
    }

    @Get('messages/users/:id')
    @ApiOperation({ summary: 'Get messages by user ID and keywords' })
    @ApiOkResponse({ description: 'Messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or messages not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getMessagesByUserId(
        @Param('id') id: string,
    ): Promise<GetMessagesByUserResponseDto> {
        console.log('Get User Messages')
        if (id) {
            return this.messageService.getUserMessages(id);
        } else {
            throw new BadRequestException('Invalid parameters');
        }
    }


    @Get('users/:id/messages')
    @ApiOperation({ summary: 'Get messages by keywords or filter or tags' })
    @ApiOkResponse({ description: 'Messages retrieved successfully', type: GetMessagesByUserResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or messages not found' })
    async getMessages(
        @Param('id') id: string,
        @Query('keywords') keywords: string[],
        @Query('filter') filter: string,
        @Query('tags') tags: string[], 

    ): Promise<GetMessagesByUserResponseDto> {
        if (keywords) {
            return await this.messageService.searchMessagesByKeywords(id, keywords);
        } else if (filter && !keywords) {
            return await this.messageService.getFilteredMessages(filter, id);
        } else if (tags && !filter && !keywords) {
            return await this.messageService.searchMessagesByTags(id, tags);
        } else {
            throw new BadRequestException('Invalid parameters');
        }
    }




    @ApiOperation({ summary: 'Update message status to read, unread, inquiry, complaint, archived, unarchived, deactivated, activated, highlighted' })
    @ApiOkResponse({ description: 'Message status updated successfully', type: UpdateMessageStatusResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Put('messages')
    async updateMessageStatus(
        @Body() dto: UpdateMessageStatusDto,
    ): Promise<UpdateMessageStatusResponseDto> {
        try {

            const id = dto.id

            return await this.messageService.updateMessageStatus(id, dto);
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error updating the message status.');
        }
    }




    @ApiOperation({ summary: 'Add or remove tags to/from a message based on user email and tag names' })
    @ApiCreatedResponse({
        description: 'Tags added or removed from the message successfully',
        type: AddTagsResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Bad request or missing parameters', type: HttpException })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Patch('messages/tags')
    async addOrRemoveTagsToMessageByUserEmailAndTagNames(
        @Body('id') id: string,
        @Body('tagsIds') tagsIds: string[],
        @Body('action') action: 'add' | 'delete',

    ): Promise<AddTagsResponseDto> {
        try {
            if (!id || !tagsIds || !action) {
                throw new HttpException('Missing required parameters', HttpStatus.BAD_REQUEST);
            }

            const response = await this.messageService.addOrRemoveTagsFromMessage(id, action, tagsIds);
            return response;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new HttpException('Error adding tags to the message', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

   



}