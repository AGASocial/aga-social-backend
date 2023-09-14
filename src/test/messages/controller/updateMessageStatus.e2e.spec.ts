import { Test, TestingModule } from '@nestjs/testing';
import { UpdateMessageStatusDto } from '../../../messages/dto/updateMessageStatus.dto';
import { UpdateMessageStatusResponseDto } from '../../../messages/dto/updateMessageStatusResponse.dto';
import { MessageController } from '../../../messages/message.controller';

describe('MessageController (e2e)', () => {
    let messageController: MessageController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessageController],
        }).compile();

        messageController = module.get<MessageController>(MessageController);
    });

    it('should update message status successfully', async () => {
        const messageId = 'b510328a-928d-45f7-8040-50568a6542a4';
        const updateMessageStatusDto: UpdateMessageStatusDto = {
            archived: true,
            highlighted: true,
        };

        const response: UpdateMessageStatusResponseDto = await messageController.updateMessageStatus(
            messageId,
            updateMessageStatusDto,
        );

        expect(response.message).toBe('MESSAGESTATUSSETSUCCESSFULLY');
    });
});
