import { Body, Controller, Delete, Get, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Put, Query } from "@nestjs/common";
import { CreateMessageDto } from "./dto/createMessage.dto";
import { CreateMessageResponseDto } from "./dto/createMessageResponse.dto";
import { DeleteMessageDto } from "./dto/deleteMessage.dto";
import { DeleteMessageResponseDto } from "./dto/deleteMessageResponse.dto";
import { GetMessagesByKeywordsDto } from "./dto/getMessagesByKeywords.dto";
import { GetMessagesByUserResponseDto } from "./dto/getMessagesByUserResponse.dto";
import { MarkAsArchivedDto } from "./dto/markAsArchived.dto";
import { MarkAsArchivedResponseDto } from "./dto/markAsArchivedResponse.dto";
import { MarkAsReadDto } from "./dto/markAsRead.dto";
import { MarkAsReadResponseDto } from "./dto/markAsReadResponse.dto";
import { MessageService } from "./message.service";





@Controller()
export class MessageController {
    constructor(private readonly messageService: MessageService) { }


    @Post('firebase/messages')
    async createAndSendMessage(@Body() createNewMessageDto: CreateMessageDto): Promise<CreateMessageResponseDto> {
        try {
            const responseDto = await this.messageService.createAndSendMessage(createNewMessageDto);
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }



    @Delete('firebase/messages')
    async deleteMessage(@Body() deleteMessageDto: DeleteMessageDto): Promise<DeleteMessageResponseDto> {
        try {
            const responseDto = await this.messageService.deleteMessage(deleteMessageDto);
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }

    @Get('firebase/messages/:userEmail')
    async getUserMessages(@Param('userEmail') userEmail: string): Promise<GetMessagesByUserResponseDto> {
        return this.messageService.getUserMessages(userEmail);
    }


    @Get('firebase/messages/received/:userEmail')
    async getReceivedMessages(@Param('userEmail') userEmail: string): Promise<GetMessagesByUserResponseDto> {
        return this.messageService.getReceivedMessages(userEmail);
    }

    @Get('firebase/messages/sent/:userEmail')
    async getSentMessages(@Param('userEmail') userEmail: string): Promise<GetMessagesByUserResponseDto> {
        return this.messageService.getSentMessages(userEmail);
    }



    @Put('firebase/messages/mark-as-read')
    async markMessageAsRead(@Body() markMessageAsReadDto: MarkAsReadDto): Promise<MarkAsReadResponseDto> {
        try {
            const response = await this.messageService.markMessageAsRead(markMessageAsReadDto);
            return response;
        } catch (error: unknown) {
            console.error('[ERROR]', error);
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @Get('firebase/messages/inquiries/:userEmail')
    async getInquiryMessages(@Param('userEmail') userEmail: string): Promise<GetMessagesByUserResponseDto> {
        return this.messageService.getInquiryMessages(userEmail);
    }



    @Get('firebase/messages/complaints/:userEmail')
    async getComplaintMessages(@Param('userEmail') userEmail: string): Promise<GetMessagesByUserResponseDto> {
        return this.messageService.getComplaintMessages(userEmail);
    }




    @Get('firebase/messages/keywords/:userEmail')
    async searchMessagesByKeywords(
        @Param('userEmail') userEmail: string,
        @Body('keywords') keywords: string[]
    ): Promise<GetMessagesByUserResponseDto> {
        try {
            const responseDto = await this.messageService.searchMessagesByKeywords(userEmail, keywords);
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }



    @Put('firebase/messages/mark-as-archived')
    async markMessageAsArchived(@Body() markMessageAsArchivedDto: MarkAsArchivedDto): Promise<MarkAsArchivedResponseDto> {
        try {
            const response = await this.messageService.archiveMessage(markMessageAsArchivedDto);
            return response;
        } catch (error: unknown) {
            console.error('[ERROR]', error);
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }





}