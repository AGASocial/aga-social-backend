import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MessageService } from '../../../messages/message.service';
import { AppModule } from '../../../app.module';

describe('MessageService (e2e)', () => {
    let app: INestApplication;
    let messageService: MessageService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        messageService = moduleFixture.get<MessageService>(MessageService);
    });

    it('should retrieve messages by tags for a user', async () => {
        const userId = '1w54iIFPN0M7YNgo10XuLIVUkJk2';
        const tags = ['Vero-Tag'];

        const result = await messageService.searchMessagesByTags(userId, tags);

        expect(result.statusCode).toBe(200);
        expect(result.message).toBe('MESSAGESRETRIEVEDSUCCESSFULLY');
    });

    afterEach(async () => {
        await app.close();
    });
});
