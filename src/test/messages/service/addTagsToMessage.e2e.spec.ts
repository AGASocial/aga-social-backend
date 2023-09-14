import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MessageService } from '../../../messages/message.service';
import { AddTagsResponseDto } from '../../../messages/dto/addTagsResponse.dto';

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

    it('should add tags to a message', async () => {
        const id = '43bd3e06-b81d-4a80-ba2a-ca725f5e490e';
        const action = 'add';
        const tagsIds = ['PMU-Tag'];

        try {
            const response: AddTagsResponseDto = await messageService.addOrRemoveTagsFromMessage(id, action, tagsIds);

            expect(response.message).toBe('TAGSADDEDSUCCESSFULLY');
        } catch (error) {
            fail(error);
        }
    });


    it('should remove tags to a message', async () => {
        const id = '43bd3e06-b81d-4a80-ba2a-ca725f5e490e';
        const action = 'delete';
        const tagsIds = ['PMU-Tag'];

        try {
            const response: AddTagsResponseDto = await messageService.addOrRemoveTagsFromMessage(id, action, tagsIds);

            expect(response.message).toBe('TAGSADDEDSUCCESSFULLY');
        } catch (error) {
            fail(error);
        }
    });

});
