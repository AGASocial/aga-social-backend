import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as path from 'path';
import { ExpressAdapter } from '@nestjs/platform-express';
import { MediaService } from '../../../media/media.service';
import { CreateMediaDto } from '../../../media/dto/createMedia.dto';
import { CreateMediaResponseDto } from '../../../media/dto/createMediaResponse.dto';
import { MediaType } from '../../../media/entities/media.entity';

describe('MediaService (e2e)', () => {
    let app: INestApplication;
    let mediaService: MediaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MediaService],
        }).compile();

        mediaService = module.get<MediaService>(MediaService);


    });

    afterEach(async () => {
        await app.close();
    });

    it('should upload and create media', async () => {
        const createNewMediaDto: CreateMediaDto = {
            type: MediaType.Audio,
            title: 'Title of the content',
            description: 'Description of the content',
            duration: '00:15:30',
            uploadDate: new Date(),
            active: true,
            publisher: 'Mary.123',
        };

        const file = {
            fieldname: 'file',
            originalname: 'test.mp3',
            encoding: '7bit',
            mimetype: 'audio/mp3',
            buffer: Buffer.from('content'),
            size: 1024,
        };

        const response: CreateMediaResponseDto = await mediaService.uploadAndCreateMedia(file, createNewMediaDto);

        expect(response.statusCode).toBe(201);
    });
});
