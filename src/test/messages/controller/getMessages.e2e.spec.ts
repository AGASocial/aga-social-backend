import { Test, TestingModule } from '@nestjs/testing';
import { GetMessagesByUserResponseDto } from '../../../messages/dto/getMessagesByUserResponse.dto';
import { MessageController } from '../../../messages/message.controller';

describe('MessageController (e2e)', () => {
    let messageController: MessageController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessageController],
        }).compile();

        messageController = module.get<MessageController>(MessageController);
    });

    it('should get messages by filter and id', async () => {
        const filter = 'read';
        const id = '1w54iIFPN0M7YNgo10XuLIVUkJk2';

        const response: GetMessagesByUserResponseDto = await messageController.getMessages(filter, id);

        expect(response.message).toBe('MESSAGESRETRIEVEDSUCCESSFULLY');
    });

    it('should get messages by id and keywords', async () => {
        const id = '1w54iIFPN0M7YNgo10XuLIVUkJk2';
        const keywords = ['regarding'];

        const response: GetMessagesByUserResponseDto = await messageController.getMessages('', id, keywords, []);

        expect(response.message).toBe('MESSAGESRETRIEVEDSUCCESSFULLY');
    });

    it('should get messages by id and tags', async () => {
        const id = '1w54iIFPN0M7YNgo10XuLIVUkJk2';
        const tags = ['PMU-Tag'];

        const response: GetMessagesByUserResponseDto = await messageController.getMessages('', id, [], tags);

        expect(response.message).toBe('MESSAGESRETRIEVEDSUCCESSFULLY');
    });

    it('should get user messages by id', async () => {
        const id = '1w54iIFPN0M7YNgo10XuLIVUkJk2';

        const response: GetMessagesByUserResponseDto = await messageController.getMessages('', id, [], []);

        expect(response.message).toBe('MESSAGESRETRIEVEDSUCCESSFULLY');
    });
});
