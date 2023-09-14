import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MessageService } from '../../../messages/message.service';
import { UpdateMessageStatusDto } from '../../../messages/dto/updateMessageStatus.dto';
import { UpdateMessageStatusResponseDto } from '../../../messages/dto/updateMessageStatusResponse.dto';

describe('MessageService (e2e)', () => {
    let messageService: MessageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessageService,
            ],
        }).compile();

        messageService = module.get<MessageService>(MessageService);
    });

    it('should update message status for the given ID', async () => {
        const messageId = 'b510328a-928d-45f7-8040-50568a6542a4';
        const updateDto: UpdateMessageStatusDto = {
            archived: true,
            highlighted: true,
        };

        try {
            const response: UpdateMessageStatusResponseDto = await messageService.updateMessageStatus(messageId, updateDto);

            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('MESSAGESTATUSSETSUCCESSFULLY');
        } catch (error) {
            fail(error);
        }
    });

 
});
