import { Test, TestingModule } from '@nestjs/testing';
import { CreateMessageResponseDto } from '../../../messages/dto/createMessageResponse.dto';
import { CreateMessageDto, MessageType } from '../../../messages/dto/createMessage.dto';
import { MessageService } from '../../../messages/message.service';

describe('MessageService (e2e)', () => {
    let messageService: MessageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MessageService],
        }).compile();

        messageService = module.get<MessageService>(MessageService);
    });

    it('should create and send a message', async () => {
        const createMessageDto: CreateMessageDto = {
            senderEmail: 'joel123@gmail.com',
            recipientEmail: 'mary@gmail.com',
            content: 'Hello, I have a question regarding...',
            read: false,
            archived: false,
            attachmentUrls: ['https://attachment-url1.com', 'https://attachment-url2.com'],
            subject: 'Regarding Your Recent Purchase',
            type: MessageType.Inquiry, 
        };

        const response: CreateMessageResponseDto = await messageService.createAndSendMessage(createMessageDto);

        expect(response.messageId).toBeDefined();
    });
});
