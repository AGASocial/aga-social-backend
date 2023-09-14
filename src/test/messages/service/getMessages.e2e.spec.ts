import { Test, TestingModule } from '@nestjs/testing';
import { GetMessagesByUserResponseDto } from '../../../messages/dto/getMessagesByUserResponse.dto';
import { MessageService } from '../../../messages/message.service';

describe('MessageService (e2e)', () => {
    let messageService: MessageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MessageService],
        }).compile();

        messageService = module.get<MessageService>(MessageService);
    });

    it('should get user messages', async () => {
        const userId = '1w54iIFPN0M7YNgo10XuLIVUkJk2';

        const response: GetMessagesByUserResponseDto = await messageService.getUserMessages(userId);

        expect(response.statusCode).toBe(200);
        expect(response.message).toBe('MESSAGESRETRIEVEDSUCCESSFULLY');
    });

   
});
