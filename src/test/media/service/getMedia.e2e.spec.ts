import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '../../../media/media.service';
import { GetMediaResponseDto } from '../../../media/dto/getMediaResponse.dto';

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

    describe('getMedia', () => {
        it('should get media resources', async () => {
            const result: GetMediaResponseDto = await mediaService.getMedia();

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('MEDIAGOT');

        });

    });
});
