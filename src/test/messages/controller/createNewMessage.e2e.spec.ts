import { Test, TestingModule } from '@nestjs/testing';
import { CreateMessageDto, MessageType } from '../../../messages/dto/createMessage.dto';
import { CreateMessageResponseDto } from '../../../messages/dto/createMessageResponse.dto';
import { MessageController } from '../../../messages/message.controller';

describe('MessageController (e2e)', () => {
    let messageController: MessageController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessageController],
        }).compile();

        messageController = module.get<MessageController>(MessageController);
    });

    it('should create and send a message', async () => {
        const createNewMessageDto: CreateMessageDto = {
            senderEmail: 'joel123@gmail.com',
            recipientEmail: 'mary@gmail.com',
            content: 'Hello, I have a question regarding...',
            read: false,
            archived: false,
            attachmentUrls: ['https://attachment-url1.com', 'https://attachment-url2.com'],
            subject: 'Regarding Your Recent Purchase',
            type: MessageType.Inquiry,
            sentDate: new Date(),
            receivedDate: new Date(),
            highlighted: false,
        };

        const response: CreateMessageResponseDto = await messageController.createAndSendMessage(createNewMessageDto);

        expect(response.statusCode).toBe(201);
        expect(response.message).toBe('MESSAGECREATEDSUCCESSFULLY');
    });
});
