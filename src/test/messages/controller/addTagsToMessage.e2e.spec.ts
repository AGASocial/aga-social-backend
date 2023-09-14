import { Test, TestingModule } from '@nestjs/testing';
import { AddTagsResponseDto } from '../../../messages/dto/addTagsResponse.dto';
import { MessageController } from '../../../messages/message.controller';

describe('MessageController (e2e)', () => {
    let messageController: MessageController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessageController],
        }).compile();

        messageController = module.get<MessageController>(MessageController);
    });

    it('should remove tags to/from a message successfully', async () => {
        const messageId = '43bd3e06-b81d-4a80-ba2a-ca725f5e490e';
        const tagsIds = ['87abbf5a-52ba-4312-9448-0783ad9309a5'];
        const action = 'add';

        const response: AddTagsResponseDto = await messageController.addOrRemoveTagsToMessageByUserEmailAndTagNames(
            messageId,
            tagsIds,
            action,
        );

        expect(response.message).toBe('TAGSADDEDSUCCESSFULLY');



        it('should remove tags to/from a message successfully', async () => {
            const messageId = '43bd3e06-b81d-4a80-ba2a-ca725f5e490e';
            const tagsIds = ['87abbf5a-52ba-4312-9448-0783ad9309a5'];
            const action = 'delete';

            const response: AddTagsResponseDto = await messageController.addOrRemoveTagsToMessageByUserEmailAndTagNames(
                messageId,
                tagsIds,
                action,
            );

            expect(response.message).toBe('TAGSADDEDSUCCESSFULLY');
        });




    });
});
