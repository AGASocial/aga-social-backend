import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { FirebaseService } from '../../firebase/firebase.service';
import { CreateTagDto } from '../../tags/dto/createTag.dto';
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

    it('should create a new tag', async () => {
        const createTagDto: CreateTagDto = {
            name: 'TestTagName',
            username: 'TestUsername',
        };

        const response = await tagsService.createNewTag(createTagDto);

        expect(response).toHaveProperty('statusCode', 201);
        expect(response).toHaveProperty('message', 'TAGCREATEDSUCCESSFULLY');
        expect(response).toHaveProperty('tagId');

    });


});
