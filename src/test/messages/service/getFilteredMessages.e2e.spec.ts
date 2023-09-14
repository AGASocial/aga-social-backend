import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { GetMessagesByUserResponseDto } from '../../../messages/dto/getMessagesByUserResponse.dto';
import { MessageService } from '../../../messages/message.service';

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

    it('should get read messages for a user', async () => {
        const filter = 'read';
        const userId = 'b510328a-928d-45f7-8040-50568a6542a4';

        try {
            const response: GetMessagesByUserResponseDto = await messageService.getFilteredMessages(filter, userId);

            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('READMESSAGESRETRIEVEDSUCCESSFULLY');
        } catch (error) {
            fail(error);
        }
    });

  
});
