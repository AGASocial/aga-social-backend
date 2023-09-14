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

    it('should retrieve archived messages successfully', async () => {
        const userEmail = 'mary@gmail.com';

        const response: GetMessagesByUserResponseDto = await messageService.getArchivedMessages(userEmail);

        expect(response.message).toBe('MESSAGESRETRIEVEDSUCCESSFULLY');
    });

});
