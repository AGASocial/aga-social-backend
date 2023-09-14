import { Test, TestingModule } from '@nestjs/testing';
import { UploadMediaResponseDto } from '../../../media/dto/uploadMediaFileResponse.dto';
import { MediaType } from '../../../media/entities/media.entity';
import { MediaService } from '../../../media/media.service';

describe('MediaService (e2e)', () => {
    let mediaService: MediaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MediaService], 
        }).compile();

        mediaService = module.get<MediaService>(MediaService);
    });

    it('should register media', async () => {
        const type = MediaType.Audio;
        const title = 'Title of the content';
        const description = 'Description of the content';
        const duration = '00:15:30';
        const publisher = 'Mary.123';
        const url = 'https://file_url.mp3';
        const uploadDate = new Date();

        const response: UploadMediaResponseDto = await mediaService.registerMedia(
            type,
            title,
            description,
            duration,
            publisher,
            url,
            uploadDate
        );

        expect(response.statusCode).toBe(201);
    });
});
