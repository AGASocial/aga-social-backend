import { Test, TestingModule } from '@nestjs/testing';
import { UpdateMediaDto } from '../../../media/dto/updateMedia.dto';
import { UpdateMediaResponseDto } from '../../../media/dto/updateMediaResponse.dto';
import { MediaService } from '../../../media/media.service';

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

    describe('updateMedia', () => {
        it('should update media information', async () => {
            const mediaId = 'e19e073f-cdde-4b96-a3b2-c0aba097dbbc';
            const newData: Partial<UpdateMediaDto> = {
                title: 'New Title',
                description: 'New Description',
                duration: '00:30:00',
            };

            const result: UpdateMediaResponseDto = await mediaService.updateMedia(mediaId, newData);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('MEDIAUPDATEDSUCCESSFULLY');
        });

     

    });
});
