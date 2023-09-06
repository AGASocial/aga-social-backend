import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { FirebaseService } from '../../firebase/firebase.service';
import { TagsService } from '../../tags/tags.service';

describe('TagsService (E2E)', () => {
    let tagsService: TagsService;
    let firebaseService: FirebaseService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        tagsService = moduleFixture.get<TagsService>(TagsService);
        firebaseService = moduleFixture.get<FirebaseService>(FirebaseService);
    });

    it('should retrieve tags for a user', async () => {
        const userId = '1w54iIFPN0M7YNgo10XuLIVUkJk2'; 

        const response = await tagsService.getTagsById(userId);

        expect(response).toHaveProperty('statusCode', 200);
        expect(response).toHaveProperty('tagsFound');
    });
});
