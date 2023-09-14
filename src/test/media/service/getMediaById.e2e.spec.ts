import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '../../../media/media.service';
import { GetMediaByIdResponseDto } from '../../../media/dto/getMediaByIdResponse.dto';

describe('MediaService', () => {
    let mediaService: MediaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MediaService],
        }).compile();

        mediaService = module.get<MediaService>(MediaService);
    });

    it('should be defined', () => {
        expect(mediaService).toBeDefined();
    });

    describe('getMediaById', () => {
        it('should get media resources by keywords', async () => {
            const id = 'e19e073f-cdde-4b96-a3b2-c0aba097dbbc';
            const result: GetMediaByIdResponseDto = await mediaService.getMediaById(id);

            expect(result.message).toBe('MEDIARETRIEVEDSUCCESSFULLY');

        });

    });
});
