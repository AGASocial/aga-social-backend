import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { FirebaseService } from '../../firebase/firebase.service';
import { TagsService } from '../../tags/tags.service';
import { UpdateTagDto } from '../../tags/dto/updateTag.dto';

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

    it('should update tag information', async () => {
        const existingTagId = '4f331bbc-f89e-4250-9709-bdc87548bfcf';

        const updateTagDto: UpdateTagDto = {
            name: 'UpdatedTagName',
            active: false,
        };

        const response = await tagsService.updateTag(existingTagId, updateTagDto);

        expect(response).toHaveProperty('statusCode', 200);
    });
});
